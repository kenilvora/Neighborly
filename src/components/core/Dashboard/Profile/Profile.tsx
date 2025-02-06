import ChangePassword from "./ChangePassword";
import TwoFactorAuth from "./TwoFactorAuth";
import UserInfo from "./UserInfo";

const Profile = () => {
  return (
    <div className="flex flex-col gap-5 my-5">
      <UserInfo />
      <ChangePassword />
      <TwoFactorAuth />
    </div>
  );
};

export default Profile;
