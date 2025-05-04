import React, {memo} from "react"
import { BsThreeDotsVertical } from "react-icons/bs";

function CommentMenu({ onMenu, onEdit, onDelete, menuRef, isMenuOpen }) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onMenu}
        className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xl px-2"
      >
        <BsThreeDotsVertical size={20} />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
          <button
            onClick={onEdit}
            className="block w-full text-center px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="block w-full text-center px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(CommentMenu);