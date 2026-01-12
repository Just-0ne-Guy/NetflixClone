"use client";

import { modalState } from "@/atoms/modalAtom";
import MuiModal from "@mui/material/Modal";
import { useRecoilValue } from "recoil";

function Modal() {
  const showModal = useRecoilValue(modalState);

  const handleClose = () => {
    setShowModal(false);
  };
  return (
    <MuiModal open={showModal} onClose={handleClose}>
      <>Modal</>
    </MuiModal>
  );
}

export default Modal;
