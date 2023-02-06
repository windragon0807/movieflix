import axios from "axios";

const BASE_PATH = "https://api.themoviedb.org/3";
const API_KEY = "10923b261ba94d897ac6b81148314a3f";

interface Movie {
    id: number;
    backdrop_path: string;
    poster_path: string;
    title: string;
    overview: string;
}

export interface GetMoviesResult {
    dates: {
        maximum: string;
        minimum: string;
    };
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export const getMovies = async () => {
    return await axios
        .get(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`)
        .then((response) => response.data);
};
