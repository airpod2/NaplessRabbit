import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import deliveryApi from "../apis/delivery";
import {
  Container,
  MenuWrapper,
  MenuWrapperHeader,
} from "../Components/common";
import Loading from "../Components/Loading";
import Menu from "../Components/Menu";
import MenuHeader from "../Components/MenuHeader";
import MyResponsiveBar from "../Components/MyResponsiveBar";
import { AREAS, DETAIL_AREAS } from "../constants/delivery_data";
import { loadingState, menuState } from "../state";
import { CONTENTS_BUTTON } from "../constants/Mytown_data";
import Map from "../Components/Map/Map";
import MyCombinedChart from "../Components/MyCombinedChart";
import SorryImg from "../img/sorry.png";
import { STANDARD_TITLE } from "../constants/standard";

const MytownContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.bgColor};
  color: ${(props) => props.theme.titleColor};
  overflow: scroll;
`;

const MytownBody = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 5;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 20px;
`;

const MytownMenu = styled(Menu)`
  flex-grow: 1;
  padding: 10px;
  box-sizing: border-box;
`;

const MainContents = styled.div`
  width: 80%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  flex-grow: 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SelectWrap = styled(MenuWrapper)`
  width: 100%;
  margin-bottom: 20px;
`;

const ContentsArea = styled(MenuWrapper)`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 600px;
  padding: 10px;
  box-sizing: border-box;
`;

const MapContentsArea = styled(MenuWrapper)`
  width: 600px;
  height: 500px;
  margin-right: 20px;
  box-sizing: border-box;
  padding: 10px;
`;

const GraphContentsArea = styled(MenuWrapper)`
  width: 600px;
  height: 500px;
  box-sizing: border-box;
  padding: 30px 10px 10px 10px;
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`;

//셀렉트를 위한
const Select = styled.select`
  padding: 5px;
  border-radius: 5px;
  margin-right: 8px;
  width: 130px;
`;

const Option = styled.option`
  border-radius: 5px;
`;

const SelectMessage = styled.div`
  font-size: 22px;
`;

const SubmitBtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  border-radius: 3px;
  height: 28px;
`;

const SorryImgTag = styled.img`
  width: 300px;
  height: 200px;
`;

const Mytown = () => {
  const firstLocation = useRecoilValue(menuState)[0]; //메뉴 버튼들 중 첫번째 메뉴를 의미
  const [isLoading, setIsLoading] = useRecoilState(loadingState);
  const [area, setArea] = useState(""); //첫번째 Select 도/시 선택시 값이 담길 변수
  const [detailArea, setDetailArea] = useState([]); //area가 결정되면 두번째 Select에 값 담기 위한 변수
  const [dAreaValue, setDAreaValue] = useState(""); //두번째 Select의 값
  const [apiRes, setApiRes] = useState([]); //api 통신 값을 담을 변수
  const [covidApiRes, setCovidApiRes] = useState([]); //코로나 api 통신 값을 담을 변수
  const [standardBy, setStandardBy] = useState("by_time"); //데이터 받아오는 기준 (default : 시간)
  const [year, setYear] = useState(2019);

  useEffect(() => {
    console.log(standardBy);
  }, [standardBy]);

  useEffect(() => {
    //첫번째 Select가 초기화 될경우
    if (area == "") {
      //두번째 Select도 초기화
      setDetailArea([]);
      return;
    } else {
      DETAIL_AREAS.find((element) => {
        if (element.id == area) {
          setDetailArea(element.value); //두번째 Select를 위한 값 설정
        }
      });
      console.log(area);
      //지도 클릭시 dAreaValue 값 전체로 설정
      setDAreaValue("전체");
    }
  }, [area]);

  //지도 클릭시 바로 실행되지 않는 문제 해결
  useEffect(() => {
    if (dAreaValue === "전체") {
      apiExecute();
      return;
    }
    if (dAreaValue !== "") {
      apiExecute();
      return;
    }
  }, [area, dAreaValue]);

  useEffect(() => {
    //기준 값 바뀔때마다 api 실행
    if (area !== "" && dAreaValue !== "") {
      apiExecute();
    }
    if (standardBy === "by_corona") {
      setApiRes([]);
      apiExecute();
    }
    if (standardBy !== "by_corona") {
      setCovidApiRes([]);
      apiExecute();
    }
  }, [standardBy]);

  useEffect(() => {
    apiExecute();
    return;
  }, [year]);

  //apiRes 감지
  useEffect(() => {
    console.log(apiRes);
    console.log(covidApiRes);
  }, [apiRes, covidApiRes]);

  //확인하러 가기 버튼에 연결
  const searchArea = () => {
    //첫번째 셀렉트가 입력이 안된경우
    if (area === "") {
      alert("도/시를 선택해주세요!");
      return;
    }
    if (dAreaValue === "") {
      alert("군/구를 선택해주세요!");
      return;
    }
    apiExecute();
  };

  //api 받아오는 메소드
  const apiExecute = async () => {
    try {
      //로딩 처리 (추후 시간을 재서 일정 시간보다 로딩이 빨리 끝날 경우 default 로딩 시간 지정 ) 굳이 필요는 없음
      setIsLoading(true);
      switch (standardBy) {
        case "by_time":
          console.log("시간에 따라");
          await deliveryApi
            .get_Time_Average(area, dAreaValue)
            .then((response) => {
              setApiRes(response.data);
              console.log(response.data);
              response.data.map((i, idx) =>
                console.log(i["time"], i["freqavg"])
              );
            });
          break;
        case "by_day":
          console.log("요일에 따라");
          await deliveryApi
            .get_Day_Average(area, dAreaValue)
            .then((response) => {
              setApiRes(response.data);
              console.log(response.data);
              response.data.map((i, idx) =>
                console.log(i["day"], i["freqavg"])
              );
            });
          break;
        case "by_holiday":
          console.log("공휴일에 따라");
          await deliveryApi
            .get_Holiday_Average(area, dAreaValue)
            .then((response) => {
              let res = response.data.filter((it) => it.year == year);
              console.log(res);
              setApiRes(res);
              res.map((i, idx) => console.log(i["year"], typeof i["year"]));
            });
          break;
        // 수정 필요 - 딕셔너리 합치기 위해서
        case "by_corona":
          console.log("코로나에 따라");
          await deliveryApi.get_Delta_Sum(area).then((res) => {
            console.log(res.data);
            const newData = res.data.map((data) => {
              return {
                year_month: data.year_month,
                배달건수: data.sum,
                "전달대비 확진자 증감수": data.delta,
              };
            });
            setCovidApiRes(newData);
          });
          break;
      }

      // await deliveryApi.get_Time_Average(area, dAreaValue).then((response) => {
      //   setApiRes(response.data);
      //   response.data.map((i, idx) => console.log(i["time"], i["freqavg"]));
      // });
    } catch (e) {
      console.log(e);
    }
    //로딩 완료
    setIsLoading(false);
  };

  //첫번째 셀렉트 변화 감지
  const changeFirstSelect = (e) => {
    setArea(e.target.value);
  };

  //두번째 셀렉트 변화 감지
  const changeSecondSelect = (e) => {
    setDAreaValue(e.target.value);
  };

  const changeStandardBySelect = (e) => {
    setStandardBy(e.target.value);
  };

  //연도 변경
  const changeYear = (e) => {
    console.log(typeof parseInt(e.target.value));
    console.log(parseInt(e.target.value));
    setYear(parseInt(e.target.value));
  };

  return (
    <MytownContainer>
      <MenuHeader />
      <MytownBody>
        <MytownMenu />
        <MainContents>
          <SelectWrap>
            <SelectContainer>
              <Select name="areaData" onChange={changeFirstSelect} value={area}>
                <Option value="">도/시 선택</Option>
                {AREAS.map((item) => {
                  return (
                    <Option key={`key_${item}`} value={item}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
              <Select onChange={changeSecondSelect} value={dAreaValue}>
                <Option value="">군/구 선택</Option>
                {detailArea.length !== 0 &&
                  detailArea.map((item) => {
                    return (
                      <Option key={`key_${item}`} value={item}>
                        {item}
                      </Option>
                    );
                  })}
              </Select>
              <SelectMessage>지역의 배달 주문량</SelectMessage>
            </SelectContainer>

            <SubmitBtnContainer>
              <Select onChange={changeStandardBySelect} value={standardBy}>
                <Option value="by_time">시간에 따라</Option>
                <Option value="by_day">요일에 따라</Option>
                <Option value="by_holiday">공휴일에 따라</Option>
                <Option value="by_corona">코로나에 따라</Option>
              </Select>
              {standardBy === "by_holiday" && (
                <Select onChange={changeYear} value={year}>
                  <Option value="2019">2019</Option>
                  <Option value="2020">2020</Option>
                  <Option value="2021">2021</Option>
                </Select>
              )}
              <SubmitButton onClick={searchArea}>
                {CONTENTS_BUTTON}
              </SubmitButton>
            </SubmitBtnContainer>
          </SelectWrap>
          <ContentsArea>
            <MapContentsArea>
              <MenuWrapperHeader>지도로 보기</MenuWrapperHeader>
              <Map area={area} setArea={setArea} />
            </MapContentsArea>
            <GraphContentsArea>
              {!isLoading && apiRes.length !== 0 && standardBy !== "by_corona" && (
                <MenuWrapperHeader>
                  <span>
                    {area} {dAreaValue}
                  </span>
                  <span>{STANDARD_TITLE[standardBy]}</span>
                </MenuWrapperHeader>
              )}
              {!isLoading &&
                apiRes.length !== 0 &&
                standardBy !== "by_corona" && (
                  <MyResponsiveBar data={apiRes} standardBy={standardBy} />
                )}
              {!isLoading &&
                covidApiRes.length !== 0 &&
                standardBy === "by_corona" && (
                  <MenuWrapperHeader>
                    <span>
                      {area} {dAreaValue}
                    </span>
                    <span>{STANDARD_TITLE[standardBy]}</span>
                  </MenuWrapperHeader>
                )}

              {!isLoading &&
                covidApiRes.length !== 0 &&
                standardBy === "by_corona" && (
                  <MyCombinedChart data={covidApiRes} />
                )}
              {!isLoading &&
                standardBy !== "by_corona" &&
                apiRes.length === 0 && <SorryImgTag src={SorryImg} />}
              {area !== "" &&
                !isLoading &&
                standardBy === "by_corona" &&
                covidApiRes.length === 0 && <SorryImgTag src={SorryImg} />}
            </GraphContentsArea>
          </ContentsArea>
        </MainContents>
      </MytownBody>
    </MytownContainer>
  );
};

export default Mytown;
