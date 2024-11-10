// FollowersFollowingModal.js
import { Link } from "react-router-dom";

const FollowersFollowingModal = ({ isOpen, onClose, users, title }) => {
  if (!isOpen) return null;

  console.log(users);

  return (
    <dialog open className="modal border-none outline-none">
      <div className="modal-box rounded border border-gray-600">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="flex flex-col gap-3 max-h-60 overflow-auto">
          {users.length === 0 && (
            <p className="text-sm text-slate-500">
              No {title.toLowerCase()} yet
            </p>
          )}
          {users.map((user) => (
            <Link
              to={`/profile/${user.userName}`}
              key={user._id}
              onClick={onClose}
              className="flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
            >
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={user.profileImg || "/avatar-placeholder.png"}
                    alt="profile"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">{user.fullName}</span>
                <span className="text-gray-700 text-sm">@{user.userName}</span>
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={onClose}
          className="btn btn-primary rounded-full btn-sm text-white mt-4"
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export default FollowersFollowingModal;
