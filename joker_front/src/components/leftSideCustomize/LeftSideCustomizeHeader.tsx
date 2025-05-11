import ColorPicker from "../colorPicker/ColorPicker";

const LeftSideHeader = () => {
  return (
    <>
      <p className="text-center font-bold">Arrière-plan</p>
      <ColorPicker type="articleBackGround" />
    </>
  );
};
export default LeftSideHeader;
