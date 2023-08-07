const itemList = document.getElementById("itemList");
const statsBody = document.getElementById("statsBody");

const weaponBtn = document.getElementById("weaponBtn");
const armorBtn = document.getElementById("clothBtn");
const headBtn = document.getElementById("headBtn");
const armBtn = document.getElementById("armBtn");
const legBtn = document.getElementById("legBtn");

const tdATK = document.getElementById("atk");
const tdSKILL = document.getElementById("skill");
const tdSIGHT = document.getElementById("sight");
const tdRANGE = document.getElementById("range");
const tdBASICATK = document.getElementById("basicATK");
const tdDEF = document.getElementById("def");
const tdREDUCE = document.getElementById("reduce");
const tdRESIST = document.getElementById("resist");
const tdATKSPD = document.getElementById("atkSPD");
const tdCOOLTIME = document.getElementById("cooltime");
const tdAP = document.getElementById("AP");
const tdHEAL = document.getElementById("heal");
const tdCRIT = document.getElementById("crit");
const tdSPEED = document.getElementById("speed");
const tdHP = document.getElementById("hp");
const tdMP = document.getElementById("mp");
//json에서 불러온 데이터
let data;
//stats
let totalStats = {
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
//아이템의 종류
let equippedWeapon = null;
let equippedCloth = null;
let equippedHead = null;
let equippedArm = null;
let equippedLeg = null;

loadItems();