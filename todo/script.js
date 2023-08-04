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
    const expiredList = document.getElementById("expiredList");
    itemList.innerHTML = "";
    expiredList.innerHTML = "";

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
                const li = document.createElement("li");
                //날짜계산
                var tempTotalDate = (temp.date - temp.savedDate) / DATE_CONVERT;
                const totalDate = Math.max(1, tempTotalDate);
                const divisionDate = Math.max(0, Math.min((CURRENT_DATE - temp.savedDate) / DATE_CONVERT, tempTotalDate));
                const percentDate = divisionDate / totalDate * 100;
                //날짜 표기형식 변환
                var tempDate = new Date(temp.date);
                var tempY = tempDate.getFullYear();
                var tempM = tempDate.getMonth() + 1;
                var tempD = tempDate.getDate();
                const dateToString = tempM + "월 " + tempD + "일 "
                //화면에 표시
                li.textContent = `${dateToString} || ${temp.text}`;
                li.addEventListener("click", function() {
                    deleteItem(temp.id);
                });
                //반복작업이면 :
                if(temp.isRepeat == "true") {
                    //날짜를 업데이트 해야 한다면 :
                    if (tempDate < CURRENT_DATE) {
                        while(tempDate < CURRENT_DATE || (tempY == CURRENT_DATE.getFullYear() && tempM == CURRENT_DATE.getMonth() + 1 && tempD == CURRENT_DATE.getDate())) {
                            tempY = tempDate.getFullYear();
                            tempM = tempDate.getMonth() + 1;
                            tempD = tempDate.getDate();
                            tempDate.setDate(tempDate.getDate() + 7);
                        }
                        temp.date = tempDate;
                        //이 함수 호출시 현재 loadItems는 이 명령줄에서 중단, 그러나 함수 내부에서 loadItems를 재호출한다.
                        return updateTime(temp);
                    }
                    else {
                        li.textContent += " || It's repeatable.";
                    }
                }
                //목표날짜가 오늘이면 :
                if(tempY == CURRENT_DATE.getFullYear() && tempM == CURRENT_DATE.getMonth() + 1 && tempD == CURRENT_DATE.getDate()) {
                    li.textContent += " || It's today!";
                    itemList.appendChild(li);
                }
                //목표날짜가 과거면 :
                else if(tempDate < CURRENT_DATE) {
                    li.addEventListener("contextmenu", function(e) {
                        e.preventDefault();
                        addTime(temp.id);
                    });
                    expiredList.appendChild(li);
                }
                //목표날짜가 미래면 :
                else {
                    li.textContent += ` (${percentDate}퍼센트)`;
                    itemList.appendChild(li);
                }
            }
        }
    };
}

// checkbox.checked << 코드 필요
// 아이템 저장
document.getElementById("saveButton").addEventListener("click", function() {
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
});

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