import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><FaTimes/></button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
