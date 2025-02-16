const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const userEndpoints = {
  SIGNUP: `${BACKEND_URL}/user/signup`,
  LOGIN: `${BACKEND_URL}/user/login`,
  SEND_OTP: `${BACKEND_URL}/user/sendOtp`,
  LOGOUT: `${BACKEND_URL}/user/logout`,
  GET_ME: `${BACKEND_URL}/user/me`,
  CHANGE_PASSWORD: `${BACKEND_URL}/user/changePassword`,
  RESET_PASSWORD_TOKEN: `${BACKEND_URL}/user/resetPasswordToken`,
  RESET_PASSWORD: `${BACKEND_URL}/user/resetPassword`,
  CHANGE_TWO_FACTOR_AUTH: `${BACKEND_URL}/user/changeTwoFactorAuth`,
  GET_TWO_FACTOR_AUTH: `${BACKEND_URL}/user/getTwoFactorAuth`,
  UPDATE_PROFILE: `${BACKEND_URL}/user/updateProfile`,
  GET_USER: `${BACKEND_URL}/user/getUser`,
  GET_STATISTICAL_DATA: `${BACKEND_URL}/user/getStatisticalData`,
  GET_DASHBOARD_DATA: `${BACKEND_URL}/user/getDashboardData`,
};

export const itemEndpoints = {
  CREATE_ITEM: `${BACKEND_URL}/item/create`,
  DELETE_ITEM: `${BACKEND_URL}/item/delete`,
  GET_ITEMS_OF_A_LENDER: `${BACKEND_URL}/item/getItemsOfALender`,
  GET_ITEM: `${BACKEND_URL}/item/getItem`,
  GET_ALL_ITEMS: `${BACKEND_URL}/item/getAllItems`,
  UPDATE_ITEM: `${BACKEND_URL}/item/update`,
  DELETE_ITEM_IMAGE: `${BACKEND_URL}/item/deleteItemImage`,
  ADD_NEW_IMAGES: `${BACKEND_URL}/item/addNewImages`,
  BORROW_ITEM: `${BACKEND_URL}/item/borrowItem`,
  RETURN_ITEM: `${BACKEND_URL}/item/returnItem`,
  PAYMENT_RECEIVED: `${BACKEND_URL}/item/paymentReceived`,
  GET_ALL_BORROWED_ITEMS: `${BACKEND_URL}/item/getAllBorrowedItems`,
};

export const categoryEndpoints = {
  CREATE_CATEGORY: `${BACKEND_URL}/category/create`,
  DELETE_CATEGORY: `${BACKEND_URL}/category/delete`,
  GET_ALL_CATEGORIES: `${BACKEND_URL}/category/getAll`,
};

export const ratingAndReviewEndpoints = {
  CREATE_RATING_AND_REVIEW: `${BACKEND_URL}/ratingAndReview/create`,
  GET_RATING_AND_REVIEW_USER: `${BACKEND_URL}/ratingAndReview/getOfUser`,
  GET_RATING_AND_REVIEW_ITEM: `${BACKEND_URL}/ratingAndReview/getOfItem`,
  GET_RATING_AND_REVIEW_ITEM_OF_USER: `${BACKEND_URL}/ratingAndReview/getOfItemsOfUser`,
};

export const disputeEndpoints = {
  CREATE_DISPUTE: `${BACKEND_URL}/dispute/create`,
  GET_DISPUTE_OF_ME: `${BACKEND_URL}/dispute/getDisputeCreatedByMe`,
  GET_DISPUTE_AGAINST_ME: `${BACKEND_URL}/dispute/getDisputeAgainstMe`,
  CHANGE_DISPUTE_STATUS: `${BACKEND_URL}/dispute/changeDisputeStatus`,
  GET_DISPUTE: `${BACKEND_URL}/dispute/getDispute`,
};

export const transactionEndpoints = {
  GET_ALL_TRANSACTIONS: `${BACKEND_URL}/transaction/getAll`,
  ADD_MONEY: `${BACKEND_URL}/transaction/addMoney`,
};
