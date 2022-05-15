import {Swiper, SwiperSlide} from "swiper/react";

export default function Slider({setSec, setMin} : {setSec: (n: number) => void, setMin: (n: number) => void}) {
    return (
        <div className="flex p-5 justify-center h-[100px]">
            <Swiper
                loop={true}
                slidesPerView={1}
                direction={"vertical"}
                className="mySwiper rounded w-[100px]"
                onSlideChange={(e) => {
                    setMin(e.realIndex);
                }}
            >
                {
                    Array(60).fill(0)
                        .map((_, index) => <SwiperSlide key={index}>{String(index).padStart(2, "0")}</SwiperSlide>
                        )
                }
            </Swiper>
            <span style={{alignSelf: "center"}}>:</span>
            <Swiper
                loop={true}
                slidesPerView={1}
                direction={"vertical"}
                className="mySwiper rounded w-[100px]"
                onSlideChange={(e) => {
                    setSec((e.realIndex) * 5);
                }}
            >
                {
                    Array(12).fill(0)
                        .map((_, index) => <SwiperSlide key={index}>{String(index * 5).padStart(2, "0")}</SwiperSlide>
                        )
                }
            </Swiper>
        </div>)
}