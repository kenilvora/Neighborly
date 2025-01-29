import src from "../../assets/notFound.png";

const ErrorPage = () => {
  return (
    <div className="w-full h-[calc(100vh-74.4px)] overflow-hidden flex items-center justify-center">
      <img src={src} alt="404" className="w-[30%]" />
    </div>
  );
};

export default ErrorPage;
