import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Search from "./routes/Search";
import Tv from "./routes/Tv";

const Router = () => {
    return (
        <>
            <Routes>
                <Route path="/tv" element={<Tv />} />
                <Route path="/search" element={<Search />} />
                {/* 🏷️ Router는 위에서부터 일치하는 부분을 찾아내기 때문에 중복되는 경로가 있으면 뒤로 빼야 한다. */}
                <Route path="/" element={<Home />}>
                    <Route path="/movies/:movieId" element={<Home />} />
                </Route>
            </Routes>
        </>
    );
};

export default Router;
