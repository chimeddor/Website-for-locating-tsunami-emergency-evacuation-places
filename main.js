const API_KEY = ''
async function getData(){
    const url = `https://apis.data.go.kr/1741000/TsunamiShelter4/getTsunamiShelter4List?ServiceKey=${API_KEY}&pageNo=1&numOfRows=1000&type=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const first_ray = data.TsunamiShelter.map(spot => spot.row);
    const location = first_ray[1].map(spot => [{"content":spot.new_address,"latlng": [spot.lat, spot.lon]}]);
    console.log(first_ray)
    return location;
}

var infowindow = new kakao.maps.InfoWindow({zIndex:1});
var mapContainer = document.getElementById('map');

var mapOptions = {
    center: new kakao.maps.LatLng(37.56683319211237,126.9785390656771),
    level: 3
};

var map = new kakao.maps.Map(mapContainer, mapOptions);

var ps = new kakao.maps.services.Places(); 

// 키워드로 장소를 검색합니다                
document.getElementById("btn").onclick = function(){
    var keyword = searchFunction();
    ps.keywordSearch(keyword, placesSearchCB); 

}

function searchFunction(){
    var getKeyword = document.getElementById("keyword").value;
    return getKeyword
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB (data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        for (var i=0; i<data.length; i++) {
            displayMarker(data[i]);    
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }       

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    } 
}

getData().then(location => {

    for (var i = 0; i < location.length; i ++) {
        var marker = new kakao.maps.Marker({
            map:map,
            position: new kakao.maps.LatLng(location[i][0]["latlng"][0],location[i][0]["latlng"][1])
        });
        
        
        // mark 클릭 시 content 보여 주는 것. (content은 new_address)
        var infowindow = new kakao.maps.InfoWindow({
            content: location[i][0].content
        });

        kakao.maps.event.addListener(marker,'mouseover', makeOverListener(map,marker,infowindow));
        kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
    }
});

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
    
    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 지도에 교통정보를 표시하도록 지도타입을 추가합니다
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);   

// 지도에 지형정보를 표시하도록 지도타입을 추가합니다
// map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);   

// 지도에 로드뷰 정보가 있는 도로를 표시하도록 지도타입을 추가합니다
// map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);    

// 마우스 클릭 시 마우커 생성되는 코드

// ===============================
// 지도를 클릭한 위치에 표출할 마커입니다
var marker = new kakao.maps.Marker({ 
    // 지도 중심좌표에 마커를 생성합니다 
    position: map.getCenter() 
}); 
// 지도에 마커를 표시합니다
// marker.setMap(map);


    // var iwContent = '<div style="padding:5px">' + place.place_name + '</div>'
    // var infoWindow = new kakao.maps.InfoWindow({
        
    // });
    
// 지도에 클릭 이벤트를 등록합니다
// 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng; 
    console.log(latlng)
    
    // 마커 위치를 클릭한 위치로 옮깁니다
    marker.setPosition(latlng);
        
});

// ====================================

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow) {
    return function() {
        infowindow.open(map, marker);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}