// IndexedDB 설정
const DB_NAME = "myDatabase";
const VER = 1;
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
                var tempY = temp.date.getFullYear();
                var tempM = temp.date.getMonth() + 1;
                var tempD = temp.date.getDate();
                const dateToString = tempY + "년 " + tempM + "월 " + tempD + "일 "
                //화면에 표시
                li.textContent = `${dateToString} - ${temp.text} (${percentDate}퍼센트)`;
                li.addEventListener("click", function() {
                    deleteItem(temp.id);
                });
                if(temp.date < CURRENT_DATE) {
                    expiredList.appendChild(li);
                }
                else {
                    itemList.appendChild(li);
                }
            }
        }
    };
}

// 아이템 저장
document.getElementById("saveButton").addEventListener("click", function() {
    const text = document.getElementById("text").value;
    const date = new Date(document.getElementById("datePicker").value);
    const savedDate = CURRENT_DATE;
    if(!text) {
        return alert("할 일을 적어 주세요");
    }
    if(!date) {
        return alert("날짜를 정해 주세요");
    }
    const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    const obj = { text, date, savedDate };
    let req;
    try {
        req = store.add(obj);
    } catch(e) { }

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
