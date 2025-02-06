import { useState } from "react";

const TwoFactorAuth = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <div
      className="flex flex-col gap-3 px-7 py-5 rounded-lg shadow-md border 
                    border-neutral-300"
    >
      <div className="text-2xl font-semibold">Two Factor Authentication</div>

      <form className="flex items-center gap-3 w-[50%] max-[800px]:w-full">
        <div className="container">
          <input
            type="checkbox"
            className="checkbox"
            id="twoFactorAuth"
            checked={twoFactorAuth}
            onChange={() => setTwoFactorAuth(!twoFactorAuth)}
          />
          <label className="switch" htmlFor="twoFactorAuth">
            <span className="isAvailable"></span>
          </label>
        </div>
        <label htmlFor="twoFactorAuth">
          <span className="text-xl max-[450px]:text-base font-semibold">
            Enable Two Factor Authentication
          </span>
        </label>
      </form>
    </div>
  );
};

export default TwoFactorAuth;
