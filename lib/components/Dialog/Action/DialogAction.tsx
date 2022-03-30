import Button from "../../Button";

const DialogAction: typeof Button = (props) => (
  <Button
    {...props}
    variant={"outlined"}
    fullWidth
    sx={{
      borderRadius: 0,
      p: 2,
      "&::after": { display: "none" },
      "&:not(:hover)": {
        "&:first-of-type": {
          borderLeftColor: "transparent",
        },
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
      },
    }}
  />
);

export default DialogAction;