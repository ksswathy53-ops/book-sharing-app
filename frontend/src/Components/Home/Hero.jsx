import { Link } from "react-router-dom";


const Hero = () => {
  return (
    <>
      <div
        className="flex flex-col md:flex-row items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        <div className="w-full mb-12 md:mb-0 lg:w-3/6 flex flex-col items-center md:items-center lg:items-start justify-center">
          <h1
            className="text-4xl lg:text-6xl font-semibold text-yellow-100 text-center lg:text-left"
          >
            Share. Borrow. Explore.
          </h1>
          <p className="mt-4 text-xl text-zinc-300 text-center lg:text-left">
           Discover a world of books from your community. Share your own books or 
          borrow new stories, ideas, and adventures without limits.
          </p>
          <div className="mt-8">
            <Link to="/all-books" className="text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800 rounded-full hover:border-blue-500 hover:text-blue-500">
              Explore
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-3/6 flex items-center justify-center overflow-hidden">
          <img
            src="hero1.jpg"
            alt="hero"
            className="w-full h-auto object-cover rounded"
          />
        </div>
      </div>
    </>
  );
};

export default Hero;
