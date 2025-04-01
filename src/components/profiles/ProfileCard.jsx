import Button from "../ui/Button";
import { Link } from "react-router-dom";


const ProfileCard = ({ avatar_url, username, userId, country, city, connect, status, className, imageClass }) => {

    return (
      <div className={className}>
        <Link to={`/profile/${username || userId}`}>
        <img
          src={avatar_url || "/default-avatar.png"}
          alt={`${username}'s avatar`}
          className={imageClass}
        />
        </Link>
        <div className="text-center">
          <h3 className="font-semibold text-lg">{username}</h3>
        
        {country && city ? (
          <p className="text-gray-400">{city}, {country}</p>
        ) : country ? (
          <p className="text-gray-400">{country}</p>
        ) : city ? (
          <p className="text-gray-400">{city}</p>
        ) : null}
        </div>
        {status && 
          <div className="mt-auto py-4">
          <Button className="cursor-pointer" onClick={connect}>{status}</Button>
          </div>
        }
      </div>
    );
  };
  
  export default ProfileCard;