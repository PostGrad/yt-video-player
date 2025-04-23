import { MantineProvider } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./components/Admin";
import CategoryPlayer from "./components/CategoryPlayer";
import "@mantine/core/styles.css";
import "@fontsource/jetbrains-mono";
import "./index.css";

function App() {
  const categories = ["kirtan", "dhun", "katha"];

  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gray-100 font-sans">
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    Video Player Admin
                  </h1>
                  <div className="flex justify-center space-x-8 mb-12">
                    {categories.map((category) => (
                      <a
                        key={category}
                        href={`/${category}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
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
    </MantineProvider>
  );
}

export default App;
