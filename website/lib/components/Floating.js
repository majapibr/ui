import {cloneElement, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import * as FloatingUI from '@floating-ui/react-dom';

export function Floating({
  children,
  content,
  tooltipStyle = {},
  middleware = [],
  portaled,
  minHeight,
  transition,
  arrow,
  ...options
}) {
  const [{height}, setDimensions] = useState({
    width: null,
    height: null,
  });
  const arrowRef = useRef();
  const {
    x,
    y,
    reference,
    floating,
    update,
    middlewareData,
    refs,
  } = FloatingUI.useFloating({
    middleware:
      [
        ...middleware,
        ...(arrow
          ? [FloatingUI.arrow({element: arrowRef, padding: 5})]
          : []),
      ]
        ?.map(({name, options}) => {
          if (name === 'size') {
            return FloatingUI.size?.({
              ...options,
              apply: ({width, height}) => {
                setDimensions({
                  width,
                  height: minHeight
                    ? Math.max(height, minHeight)
                    : Math.max(height, 0),
                });
              },
            });
          }

          if (name === 'hide') {
            return [
              FloatingUI.hide(),
              FloatingUI.hide({strategy: 'escaped'}),
            ];
          }

          return FloatingUI[name]?.(options);
        })
        .flat()
        .filter((v) => v) ?? [],
    ...options,
  });

  useEffect(() => {
    function addTransition() {
      if (transition) {
        requestAnimationFrame(() => {
          if (refs.floating.current) {
            refs.floating.current.style.transition =
              'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
          }
        });
      }
    }

    function removeTransition() {
      if (refs.floating.current) {
        refs.floating.current.style.transition = '';
      }
    }

    if (x != null && transition) {
      addTransition();
    }

    window.addEventListener('resize', () => {
      removeTransition();
      addTransition();
    });

    return () => {
      window.removeEventListener('resize', removeTransition);
    };
  }, [x, transition, refs.floating]);

  useEffect(() => {
    const nodes = [
      ...FloatingUI.getOverflowAncestors(refs.reference.current),
      ...FloatingUI.getOverflowAncestors(refs.floating.current),
    ];

    nodes.forEach((node) => {
      node.addEventListener('scroll', update);
      node.addEventListener('resize', update);
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener('scroll', update);
        node.removeEventListener('resize', update);
      });
    };
  }, [reference, floating, update, refs]);

  const tooltipJsx = (
    <div
      className="grid place-items-center bg-gray-500 text-gray-50 z-10 rounded"
      ref={floating}
      style={{
        ...tooltipStyle,
        position: 'absolute',
        left: x != null ? 0 : '',
        top: y != null ? 0 : '',
        transform:
          x != null
            ? `translate3d(${Math.round(x)}px,${Math.round(
                y
              )}px,0)`
            : '',
        maxHeight: height ?? '',
        backgroundColor: middlewareData.hide?.escaped
          ? 'red'
          : '',
        visibility:
          middlewareData.hide?.referenceHidden || x == null
            ? 'hidden'
            : '',
      }}
    >
      <div className="px-2 py-2">{content ?? 'Floating'}</div>
      {arrow && (
        <div
          ref={arrowRef}
          className="w-4 h-4 bg-gray-500 [left:-0.5rem]"
          style={{
            position: 'absolute',
            left: middlewareData.arrow?.x ?? '',
            top: middlewareData.arrow?.y ?? '',
            transition: 'transform 0.2s ease',
            transform:
              middlewareData.arrow?.centerOffset !== 0
                ? 'translateX(1rem) rotate(45deg)'
                : 'rotate(45deg)',
          }}
        />
      )}
    </div>
  );

  return (
    <>
      {cloneElement(children, {ref: reference})}
      {portaled && typeof document !== 'undefined'
        ? createPortal(
            tooltipJsx,
            document.getElementById('floating-root')
          )
        : tooltipJsx}
    </>
  );
}