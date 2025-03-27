import { useState } from "react";
import { RootState } from "../../../../reducer/store";
import { useDispatch, useSelector } from "react-redux";
import { setOtpType, setTwoFactorAuthData } from "../../../../slices/userSlice";
import { sendOtp } from "../../../../services/operations/userAPI";
import { useNavigate } from "react-router-dom";

const TwoFactorAuth = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [twoFactorAuth, setTwoFactorAuth] = useState(
    user?.twoFactorAuth as boolean
  );

  return (
    <div
      className="flex flex-col gap-3 px-7 py-5 rounded-lg shadow-md border 
                    border-neutral-300"
    >
      <div className="text-2xl font-semibold max-[500px]:text-xl">Two Factor Authentication</div>

      <form className="flex items-center gap-3 w-full">
        <div className="container max-[500px]:mt-1">
          <input
            type="checkbox"
            className="checkbox"
            id="twoFactorAuth"
            checked={twoFactorAuth}
            onChange={() => {
              setTwoFactorAuth((prev) => !prev);
              dispatch(setOtpType("twoFactorAuth"));
              dispatch(
                setTwoFactorAuthData({
                  email: user?.email,
                  twoFactorAuth: !twoFactorAuth,
                })
              );
              dispatch(sendOtp(user?.email!, navigate, "twoFactorAuth") as any);
            }}
          />
          <label className="switch" htmlFor="twoFactorAuth">
            <span className="isAvailable"></span>
          </label>
        </div>
        <label htmlFor="twoFactorAuth">
          <span className="text-xl max-[450px]:text-sm font-semibold">
            {twoFactorAuth ? "Disable" : "Enable"} Two Factor Authentication
          </span>
        </label>
      </form>
    </div>
  );
};

export default TwoFactorAuth;
