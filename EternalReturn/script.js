// 아이템 정보를 불러온 후 초기화
async function loadItems() {
    const response = await fetch("items.json");
    data = await response.json();
    weaponBtn.addEventListener("click", () => filterItems("weapon"));
    armorBtn.addEventListener("click", () => filterItems("cloth"));
    headBtn.addEventListener("click", () => filterItems("head"));
    armBtn.addEventListener("click", () => filterItems("arm"));
    legBtn.addEventListener("click", () => filterItems("leg"));
    updateStatsTable();
}

// 아이템 필터링
function filterItems(type) {
    console.log("filter" + type)
    itemList.innerHTML = "";

    for (const item of data) {
        if (item.type === type) {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.addEventListener("click", () => equipItem(item));

            itemList.appendChild(li);
        }
    }
}

// 아이템 착용
function equipItem(item) {
    if (item.type === "weapon") {
        equippedWeapon = item;
    } else if (item.type === "cloth") {
        equippedCloth = item;
    } else if (item.type == "head") {
        equippedHead = item;
    } else if (item.type == "arm") {
        equippedArm = item;
    } else if (item.type == "leg") {
        equippedLeg = item;
    }

    updateStatsTable();
}

// 스탯 테이블 업데이트
function updateStatsTable() {
    totalStats = {
        "atk": 0,
        "def": 0,
        "skill": 0,
        "basicATK": 0,
        "atkSPD": 0,
        "crit": 0,
        "cooltime": 0,
        "speed": 0,
        "critReduce": 0,
        "atkReduce": 0,
        "skillReduce": 0,
        "mp": 0,
        "mpRegen": 0,
        "hp": 0,
        "hpRegen": 0,
        "AP": 0,
        "resist": 0,
        "atkheal": 0,
        "skillheal": 0,
        "range": 0,
        "sight": 0,
        "original" : ""
    }
    for(const item of [equippedWeapon, equippedCloth]) {
        if(item) {
            for(const statKey in totalStats) {
                if(item.stats[statKey]) {
                    totalStats[statKey] += item.stats[statKey];
                }
            }
            totalStats.original += " ";
        }
    }
    //html에 반영
    console.log(totalStats);
    tdATK.innerHTML = totalStats.atk;
    tdSKILL.innerHTML = totalStats.skill;
    tdSIGHT.innerHTML = totalStats.sight;
    tdRANGE.innerHTML = totalStats.range;
    tdBASICATK.innerHTML = totalStats.basicATK;
    tdDEF.innerHTML = totalStats.def;
    tdREDUCE.innerHTML = totalStats.atkReduce + " | " + totalStats.skillReduce;
    tdRESIST.innerHTML = totalStats.resist;
    tdATKSPD.innerHTML = totalStats.atkSPD;
    tdCOOLTIME.innerHTML = totalStats.cooltime;
    tdAP.innerHTML = totalStats.AP;
    tdHEAL.innerHTML = totalStats.atkheal + " | " + totalStats.skillheal;
    tdCRIT.innerHTML = totalStats.crit;
    tdSPEED.innerHTML = totalStats.speed;
    tdHP.innerHTML = totalStats.hp + " | " + totalStats.hpRegen;
    tdMP.innerHTML = totalStats.mp + " | " + totalStats.mpRegen;
}
