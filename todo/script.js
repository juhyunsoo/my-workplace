// IndexedDB 설정
const DB_NAME = "myDatabase";
const VER = 1;
const STORE_NAME = "data";

let db;
function openDB() {
    const openRequest = indexedDB.open(DB_NAME, VER);

    openRequest.onupgradeneeded = function(event) {
        db = event.target.result;
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("text", "text", { unique: false });
        store.createIndex("date", "date", { unique: false });
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
    itemList.innerHTML = "";

    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
    const buffer = [];
    store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            buffer.push(cursor.value);
            cursor.continue();
        }
        //모든 데이터 불러온 다음 날짜순으로 정렬
        else {
            buffer.sort((a, b) => new Date(a.date) - new Date(b.date));
            for(const temp of buffer) {
                const li = document.createElement("li");
                li.textContent = `${temp.date} - ${temp.text}`;
                li.addEventListener("click", function() {
                    deleteItem(temp.id);
                });
                itemList.appendChild(li);
            }
        }
    };
}

// 아이템 저장
document.getElementById("saveButton").addEventListener("click", function() {
    const text = document.getElementById("text").value;
    const date = document.getElementById("datePicker").value;
    if(!text) {
        return alert("할 일을 적어 주세요");
    }
    if(!date) {
        return alert("날짜를 정해 주세요");
    }
    const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    const obj = { text, date };
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
