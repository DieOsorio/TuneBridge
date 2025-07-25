import { memo, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";

type CommentMenuProps = {
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isMenuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
};

function CommentMenu({
  onMenu,
  onEdit,
  onDelete,
  isMenuOpen,
  menuRef,
}: CommentMenuProps) {
  const { t } = useTranslation("common");

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onMenu}
        className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xl px-2"
      >
        <BsThreeDotsVertical size={20} />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-700 rounded shadow-lg z-10">
          <button
            onClick={onEdit}
            className="block w-full text-center px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {t("generic.edit")}
          </button>
          <div className="border-t border-zinc-300 dark:border-zinc-700" />
          <button
            onClick={onDelete}
            className="block w-full text-center px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
          >
            {t("generic.delete")}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(CommentMenu);
