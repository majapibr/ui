import {
  cloneElement,
  Dispatch,
  forwardRef,
  HTMLProps,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import mergeRefs from "react-merge-refs";
import type {
  Placement,
  UseFloatingReturn,
} from "@floating-ui/react-dom-interactions";
import {
  autoUpdate,
  flip,
  FloatingDelayGroup,
  FloatingPortal,
  offset,
  shift,
  useDelayGroup,
  useDelayGroupContext,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react-dom-interactions";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipState
  extends UseFloatingReturn,
    ReturnType<typeof useInteractions> {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

type Delay =
  | number
  | Partial<{
      open: number;
      close: number;
    }>;

export function useTooltipState({
  initialOpen = false,
  placement = "bottom",
  id,
  delayGroupContext,
  delay,
}: {
  initialOpen?: boolean;
  placement?: Placement;
  id?: any;
  delayGroupContext?: {
    delay: Delay;
    currentId: any;
    setCurrentId: (id: any) => void;
  };
  delay?: Delay;
} = {}) {
  const [open, setOpen] = useState(initialOpen);

  // noinspection JSUnusedGlobalSymbols
  const data = useFloating({
    placement,
    open,
    onOpenChange(open) {
      setOpen(open);

      if (open && delayGroupContext) {
        delayGroupContext.setCurrentId(id);
      }
    },
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift()],
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    delay: delay || delayGroupContext?.delay,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...(data as any),
    }),
    [open, setOpen, interactions, data]
  );
}

export const TooltipAnchor = forwardRef(function TooltipAnchor(
  {
    children,
    state,
    asChild = false,
    ...props
  }: { children: JSX.Element | string; asChild?: boolean; state: TooltipState },
  propRef
) {
  const ref = useMemo(
    () => mergeRefs([state.reference, propRef, (children as any).ref]),
    [state.reference, propRef, children]
  );

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && typeof children !== "string") {
    return cloneElement(
      children,
      state.getReferenceProps({ ref, ...props, ...children.props })
    );
  }

  return (
    <button ref={ref} {...state.getReferenceProps(props)}>
      {children}
    </button>
  );
});

export const TooltipContent = forwardRef(function TooltipContent(
  { state, ...props }: { state: TooltipState } & HTMLProps<HTMLDivElement>,
  propRef
) {
  const { delay } = useDelayGroupContext();

  const ref = useMemo(
    () => mergeRefs([state.floating, propRef]),
    [state.floating, propRef]
  );

  return (
    <FloatingPortal>
      <AnimatePresence>
        {state.open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={
              // When in "grouped phase", make the transition faster
              // The open delay becomes 1ms during this phase.
              typeof delay === "object" && delay.open === 1
                ? { duration: 0.08 }
                : { type: "spring", damping: 20, stiffness: 300 }
            }
            className="z-10 rounded bg-gray-900/95 px-2 py-1 text-sm text-white"
            ref={ref}
            style={{
              position: state.strategy,
              top: state.y ?? 0,
              left: state.x ?? 0,
              ...props.style,
            }}
            {...state.getFloatingProps(props)}
          />
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
});

export default function Tooltip({
  children,
  content,
  placement,
  delay,
}: {
  children: JSX.Element;
  content: ReactNode;
  placement?: Placement;
  delay?: Delay;
}) {
  const delayGroupContext = useDelayGroupContext();

  // We extended the hook to support these options.
  const state = useTooltipState({
    delayGroupContext,
    id: content,
    placement,
    delay,
  });

  useDelayGroup(state.context, { id: content });

  return (
    <>
      <TooltipAnchor state={state} asChild>
        {children}
      </TooltipAnchor>
      <TooltipContent state={state}>{content}</TooltipContent>
    </>
  );
}

Tooltip.Group = function TooltipGroup({
  children,
  delay = 200,
}: {
  children: ReactNode;
  delay?: Delay;
}) {
  return <FloatingDelayGroup delay={delay}>{children}</FloatingDelayGroup>;
};