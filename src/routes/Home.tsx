import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { getMovies, IGetMoviesResult } from "../services/api";
import { makeImagePath } from "../services/utils";
import { useState } from "react";
import { useNavigate, useMatch } from "react-router-dom";

const rowVariants = {
    hidden: {
        x: window.outerWidth + 5,
        // 🏷️ 브라우저 width만큼
        // 🏷️ 애니메이션으로 넘어갈 때 마지막과 처음 사이 붙어있는 부분 gap 주기 위해 10 추가 부여
    },
    visible: {
        x: 0,
    },
    exit: {
        x: -window.outerWidth - 5,
    },
};

const boxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        scale: 1.3,
        y: -80,
        transition: {
            // 🏷️ hover 시에만 적용
            delay: 0.5,
            duaration: 0.1,
            type: "tween", // spring -> linear
        },
    },
};

const infoVariants = {
    hover: {
        opacity: 0.8,
        transition: {
            delay: 0.5,
            duaration: 0.1,
            type: "tween",
        },
    },
};

const offset = 6;

const Home = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery<IGetMoviesResult>(["movies", "nowPlaying"], getMovies);
    // 📌 배너 클릭 시, 슬라이더 인덱스 증가시키기
    const [index, setIndex] = useState(0); // Slider 페이지 수
    const [leaving, setLeaving] = useState(false); // Slider 애니메이션 진행 상태
    const toggleLeaving = () => setLeaving((prev) => !prev);
    const increaseIndex = () => {
        if (data) {
            if (leaving) return;
            toggleLeaving();
            const totalMovies = data.results.length - 1; // 배너에서 하나 쓰이기 때문
            const maxIndex = Math.floor(totalMovies / offset) - 1; // 총 스크롤 페이지
            setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
        }
    };

    const onBoxClicked = (movieId: number) => {
        // 박스 클릭 시 영화 상세보기로 이동
        navigate(`/movies/${movieId}`);
    };
    const bigMovieMatch = useMatch("/movies/:movieId");
    // console.log(bigMovieMatch);
    const onOverlayClick = () => navigate("/"); // 영화 상세보기 뒷 배경 클릭 시, 홈으로 이동
    const { scrollY } = useScroll();
    // 현재 movieId에 해당하는 데이터 하나만 가져오기
    const clickedMovie =
        bigMovieMatch?.params.movieId &&
        data?.results.find((movie) => movie.id === +bigMovieMatch?.params.movieId!!);

    return (
        <Wrapper>
            {isLoading ? (
                <Loader>Loading...</Loader>
            ) : (
                <>
                    <Banner
                        onClick={increaseIndex}
                        bgphoto={makeImagePath(data?.results[0].backdrop_path || "")} // 🏷️
                    >
                        <Title>{data?.results[0].title}</Title>
                        <Overview>{data?.results[0].overview}</Overview>
                    </Banner>
                    <Slider>
                        <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                            {/* 🏷️ initial 🏷️ onExitComplete */}
                            <Row
                                variants={rowVariants} // 🏷️
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ type: "tween", duration: 1 }} // 🏷️ tween === linear animation
                                key={index} // 🏷️ index를 바꿔서 다른 컴포넌트로 인식시켜서 exit 애니메이션을 실행
                            >
                                {data?.results
                                    .slice(1) // 첫 번째 요소를 제외한 나머지 요소들 반환
                                    .slice(offset * index, offset * index + offset)
                                    .map((movie) => (
                                        <Box
                                            layoutId={movie.id + ""}
                                            key={movie.id}
                                            variants={boxVariants}
                                            initial="normal"
                                            whileHover="hover"
                                            transition={{ type: "tween" }} // 모든 애니메이션 linear
                                            onClick={() => onBoxClicked(movie.id)}
                                            bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                                        >
                                            <Info variants={infoVariants}>
                                                {/* 🏷️ 부모에서 설정된 animation 설정들이 그대로 상속된다. */}
                                                <h4>{movie.title}</h4>
                                            </Info>
                                        </Box>
                                    ))}
                            </Row>
                        </AnimatePresence>
                    </Slider>
                    <AnimatePresence>
                        {bigMovieMatch ? (
                            <>
                                <Overlay
                                    onClick={onOverlayClick}
                                    exit={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                                <BigMovie
                                    style={{ top: scrollY.get() + 100 }}
                                    layoutId={bigMovieMatch.params.movieId}
                                >
                                    {clickedMovie && (
                                        <>
                                            <BigCover
                                                style={{
                                                    backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                                                        clickedMovie.backdrop_path,
                                                        "w500"
                                                    )})`,
                                                }}
                                            />
                                            <BigTitle>{clickedMovie.title}</BigTitle>
                                            <BigOverview>{clickedMovie.overview}</BigOverview>
                                        </>
                                    )}
                                </BigMovie>
                            </>
                        ) : null}
                    </AnimatePresence>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    background: black;
    padding-bottom: 200px;
`;

const Loader = styled.div`
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Banner = styled.div<{ bgphoto: string }>`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
        url(${(props) => props.bgphoto});
    // 🏷️ 배경화면을 겹쳐서 설정할 수 있다.
    // 🏷️ 두 겹을 해놓는 이유는 글자가 바로 포스터와 겹치면 가독성이 떨어지기 때문
    background-size: cover;
`;

const Title = styled.h2`
    font-size: 4vw;
    margin-bottom: 20px;
`;

const Overview = styled.p`
    font-size: 1.2vw;
    font-weight: 400;
    line-height: 150%;
    width: 45%;
`;

const Slider = styled.div`
    position: relative;
    top: -100px;
`;

const Row = styled(motion.div)`
    display: grid;
    gap: 0.5vw;
    grid-template-columns: repeat(6, 1fr);
    position: absolute;
    width: 98%;
    left: 1%;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
    background-color: white;
    background-image: url(${(props) => props.bgphoto});
    background-size: cover;
    background-position: center center;
    height: 8.5vw;
    border-radius: 10px;
    cursor: pointer;
    &:first-child {
        transform-origin: center left; // 🏷️ 오른쪽으로만 커지도록 만들어서 짤리지 않도록
    }
    &:last-child {
        transform-origin: center right; // 🏷️ 왼쪽으로만 커지도록 만들어서 짤리지 않도록
    }
`;

const Info = styled(motion.div)`
    padding: 10px;
    background-color: ${(props) => props.theme.black.lighter};
    opacity: 0;
    position: absolute;
    width: 100%;
    bottom: 0;
    h4 {
        text-align: center;
        font-size: 16px;
    }
`;

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
`;

const BigMovie = styled(motion.div)`
    position: absolute;
    width: 40vw;
    height: 80vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-radius: 15px;
    overflow: hidden;
    background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
    width: 100%;
    background-size: cover;
    background-position: center center;
    height: 400px;
`;

const BigTitle = styled.h3`
    color: ${(props) => props.theme.white.lighter};
    padding: 20px;
    font-size: 46px;
    position: relative;
    top: -80px;
`;

const BigOverview = styled.p`
    padding: 20px;
    position: relative;
    top: -80px;
    color: ${(props) => props.theme.white.lighter};
`;

export default Home;
