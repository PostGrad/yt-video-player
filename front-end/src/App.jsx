import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./components/Admin";
import CategoryPlayer from "./components/CategoryPlayer";
import "@fontsource/jetbrains-mono";
import "./index.css";

function App() {
  const categories = ["kirtan", "dhun", "katha"];

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen">
              <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl mb-8 text-center">
                  Video Player Admin
                </h2>
                <div className="flex justify-center space-x-8 mb-12">
                  {categories.map((category) => (
                    <a
                      key={category}
                      href={`/${category}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      {category.charAt(0).toUpperCase() +
                        category.slice(1) +
                        " "}
                    </a>
                  ))}
                </div>
                <div className="max-w-2xl mx-auto">
                  <Admin />
                </div>
              </div>
            </div>
          }
        />
        {categories.map((category) => (
          <Route
            key={category}
            path={`/${category}`}
            element={<CategoryPlayer category={category} />}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
