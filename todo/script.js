// IndexedDB 설정
const DB_NAME = "myDatabase";
const VER = 5;
const STORE_NAME = "data";
const DATE_CONVERT = 1000 * 60 * 60 * 24;
const CURRENT_DATE = new Date();

let db;
function openDB() {
    const openRequest = indexedDB.open(DB_NAME, VER);

    openRequest.onupgradeneeded = function(event) {
        db = event.target.result;
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("text", "text", { unique: false });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("savedDate", "savedDate", {unique : false});
        store.createIndex("isRepeat", "isRepeat", {unique : false});
    };
    
    openRequest.onsuccess = function(event) {
        db = event.target.result;
        loadItems();
    };
    
    openRequest.onerror = function(event) {
        console.error("Error occured while opening IndexedDB");
    };
}
openDB();

// 저장된 아이템 불러오기
function loadItems() {
    const itemList = document.getElementById("itemList");
    itemList.innerHTML = "<tr><td id='init'>&nbsp;</td></tr>";

    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
    const buffer = [];
    store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            buffer.push(cursor.value);
            cursor.continue();
        }
        //모든 데이터를 불러왔다면, 날짜순으로 정렬해 화면에 출력
        else {
            buffer.sort((a, b) => new Date(a.date) - new Date(b.date));
            for(const temp of buffer) {
                const tr = document.createElement("tr");
                //날짜계산
                const savedDate = new Date(temp.savedDate);
                const percentDate = 100 - Math.min(100, (temp.date - CURRENT_DATE)/DATE_CONVERT/21 * 100);
                //날짜 표기형식 변환
                var tempDate = new Date(temp.date);
                var tempY = tempDate.getFullYear();
                var tempM = tempDate.getMonth() + 1;
                var tempD = tempDate.getDate();
                const dateToString = tempM + " / " + tempD;
                //화면에 표시할 내용
                tr.innerHTML = `<td>${temp.text}</td><td>${dateToString}</td><td><input type="radio" class="repeatable"></td><td class="info">` + savedDate + "</td>";
                tr.addEventListener("click", function() {
                    deleteItem(temp.id);
                });
                //반복작업이면 :
                if(temp.isRepeat == "true") {
                    //날짜를 업데이트 해야 한다면 :
                    if(tempY == CURRENT_DATE.getFullYear() && tempM == CURRENT_DATE.getMonth() + 1 && tempD == CURRENT_DATE.getDate()) {
                    }
                    else if (tempDate < CURRENT_DATE) {
                        while(tempDate < CURRENT_DATE && !(tempY == CURRENT_DATE.getFullYear() && tempM == CURRENT_DATE.getMonth() + 1 && tempD == CURRENT_DATE.getDate())) {
                            tempDate.setDate(tempDate.getDate() + 7);
                            tempY = tempDate.getFullYear();
                            tempM = tempDate.getMonth() + 1;
                            tempD = tempDate.getDate();
                        }
                        temp.date = tempDate;
                        //이 함수 호출시 현재 loadItems는 이 명령줄에서 중단, 그러나 함수 내부에서 loadItems를 재호출한다.
                        return updateTime(temp);
                    }
                    tr.setAttribute("class", "week");
                }
                //목표날짜가 오늘이면 :
                if(tempY == CURRENT_DATE.getFullYear() && tempM == CURRENT_DATE.getMonth() + 1 && tempD == CURRENT_DATE.getDate()) {
                    tr.setAttribute("class", tr.getAttribute("class") + " today");
                }
                //목표날짜가 과거면 :
                else if(tempDate < CURRENT_DATE) {
                    tr.setAttribute("class", tr.getAttribute("class") + " past");
                    tr.addEventListener("contextmenu", function(e) {
                        e.preventDefault();
                        addTime(temp.id);
                    });
                }
                //목표날짜가 미래면 :
                else {
                    tr.setAttribute("class", tr.getAttribute("class") + " future");
                    tr.setAttribute("value", percentDate);
                }
                //체크박스가 체크되어 있다면, 루틴 작업만 화면에 표시
                const checkbox = document.getElementById("checkBox");
                if(checkbox.checked) {
                    if(temp.isRepeat == "true") {
                        itemList.appendChild(tr);
                    }
                }
                else {
                    itemList.appendChild(tr);
                }
            }
        }
        popUpinsert();
    };
}

// 아이템 저장
function saveItem() {
    //반복실행 여부 체크
    const checkbox = document.getElementById("checkBox");
    let isRepeat = "false";
    if(checkbox.checked) {
        console.log("it is routine data");
        isRepeat = "true";
    }
    //===========================
    const text = document.getElementById("text").value;
    if(!text) {
        return alert("할 일을 적어 주세요");
    }
    var date_raw = document.getElementById("datePicker").value;
    if(date_raw == '') {
        return alert("날짜를 정해 주세요");
    }
    //===========================
    const date = new Date(date_raw);
    const savedDate = CURRENT_DATE;
    const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    const obj = { text, date, savedDate, isRepeat };
    let req;
    try {
        req = store.add(obj);
    } catch(e) { }
    //이후 처리
    req.onsuccess = function() {
        console.log("item saved successfully")
        document.getElementById("text").value = "";
        document.getElementById("datePicker").value = "";
        loadItems();
    };
}

// 아이템 삭제
function deleteItem(id) {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    transaction.oncomplete = loadItems;
}

//시간 연장
function addTime(id) {
    const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    let req = store.get(id);
    req.onerror = function(e) {
        console.log("error occured while getting data to edit")
    }

    req.onsuccess = function(e) {
        console.log("editing date : " + (CURRENT_DATE.getDate() + 1))
        var data = e.target.result;
        //현재 날짜 + 1일로 변경
        data.date = new Date(CURRENT_DATE);
        data.date.setDate(CURRENT_DATE.getDate() + 1);

        //업데이트
        var reqUpdate = store.put(data);
        reqUpdate.onerror = function(e) {
            console.log("error occured while editing data");
        }
        reqUpdate.onsuccess = function(e) {
            console.log("edited data : date + 1");
            loadItems();
        }
    }
}
//반복 옵션이 체크된 데이터가 목표일이 만료된 경우, 호출된다.
function updateTime(data) {
    const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    let req = store.get(data.id);
    req.onerror = function(e) {
        console.log("error occured while getting data to update")
    }

    req.onsuccess = function(e) {
        //업데이트
        var reqUpdate = store.put(data);
        reqUpdate.onerror = function(e) {
            console.log("error occured while editing data");
        }
        reqUpdate.onsuccess = function(e) {
            console.log("edited data : date + 1");
            loadItems();
        }
    }
}
//팝업창을 띄우는 코드 -> 완료 후 colorData 호출
function popUpinsert() {
    const info = document.getElementsByClassName("info");
    for(let element of info) {
        //팝업창에 띄울 문자 생성
        const savedDate = element.innerHTML;
        var tempM = new Date(savedDate).getMonth() + 1;
        var tempD = new Date(savedDate).getDate();
        element.innerHTML = "";

        const container = document.createElement("div");
        container.setAttribute("class", "popup-container");

        const img = document.createElement("img");
        img.src = "info.png";
        //이미지 크기를 일반적인 tr 높이에 맞춘다.
        var h = window.getComputedStyle(document.getElementById("init")).height;
        img.setAttribute("style","height:" + h + ";");
        img.setAttribute("class", "color");
        container.appendChild(img);

        const content = document.createElement("div");
        content.setAttribute("class", "popup-content");
        content.innerHTML = tempM + "월 " + tempD + "일에 저장된 작업";

        //태그를 추가
        container.appendChild(content);
        element.appendChild(container);
    }
    colorData();
}
//클래스에 따라 디자인 변경
function colorData() {
    const past = document.getElementsByClassName("past");
    const week = document.getElementsByClassName("week");
    const today = document.getElementsByClassName("today");
    const future = document.getElementsByClassName("future");
    for (let element of past) {
        const colored = element.getElementsByClassName("color");
        colored[0].style.backgroundColor = "grey";
    }
    for (let element of today) {
        const colored = element.getElementsByClassName("color");
        colored[0].style.backgroundColor = "red";
    }
    for (let element of future) {
        const colored = element.getElementsByClassName("color");
        const value = parseFloat(element.getAttribute("value"));
        const redValue = Math.floor(255 * value / 100);

        colored[0].style.backgroundColor = `rgb(${redValue}, 0, 0)`;
    }
    for (let element of week) {
        const radio = element.getElementsByClassName("repeatable");
        radio[0].checked = true;
    }
}