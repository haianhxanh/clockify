import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { FC } from "react";

interface StartButtonProps {
  toggleButton: any;
}

const StartButton: FC<StartButtonProps> = () => {
  return <PlayArrowIcon />;
};

export default StartButton;
