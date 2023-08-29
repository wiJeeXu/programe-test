const XLSX = require("xlsx");

const path = require("path");
// 读取Excel文件
const workbook = XLSX.readFile(path.join(__dirname, "慧通城市信息.xlsx"));
const sheetNames = workbook.SheetNames;
const worksheet = workbook.Sheets[sheetNames[0]];

const jsonData = XLSX.utils.sheet_to_json(worksheet);

// const obj = {};
// 过滤成中国数据
const china = jsonData.filter(
  (item) => item["country_name_en（国家英文名）"] === "China"
);

const citys = china.filter((item) => item["city_level（城市等级）"] === "city");

// // 过滤省份并去重
// const provinces = [
//   ...new Set(china.map((item) => item["province_name（省份中文名）"])),
// ];

// // 获取所有城市
// function getCitys(province) {
//   const city = china
//     .filter((item) => item["province_name（省份中文名）"] === province)
//     .filter((item) => item["city_level（城市等级）"] === "city");
//   obj[province] = city;
// }
// provinces.forEach((item) => getCitys(item));
function getCity(name) {
  return citys.find((item) => {
    if (
      item["city_name(城市中文名)"].trim() === name ||
      name.startsWith(item["city_name(城市中文名)"].trim())
    ) {
      return item;
    }
  });
}

function getProvince(name) {
  return china.find((item) => {
    if (
      item["province_name（省份中文名）"].trim() === name ||
      name.startsWith(item["province_name（省份中文名）"].trim())
    ) {
      return item;
    }
  });
}
console.log("excel读取完成");

const axios = require("axios");
const url = "https://www.yunzhijia.com/api/v1/basicinfo/datadictionary";
const ticket = "APPURLWITHTICKET35d63eadb4a76a3f54d7d8a6961b153e";
const buid = "5cdce000e4b0e75fae7407dd";
const cookie =
  'toweibologin=login; uuid_ce3d5ef0-6836-11e6-85a2-2d5b0666fd02=2ce65672-5d0a-444f-96b4-96b011bb540e; Hm_lvt_45f5f201f5af9cfeffd1f82177d2cceb=1693281581; Hm_lpvt_45f5f201f5af9cfeffd1f82177d2cceb=1693281581; Hm_lvt_a96914087b350d1aa86c96cdbf56d5e5=1693281581; href=https%3A%2F%2Fwww.yunzhijia.com%2Fhome%2F; accessId=ce3d5ef0-6836-11e6-85a2-2d5b0666fd02; cd=yunzhijia.com; cn=5cdce000e4b0e75fae7407dd; cu=5fb62b49e4b0213568612588; webLappToken="RTXcirUwxXfulBYDK2aHVK%2BtGmjG7qZYI0crKtW9FQMuOUGvsyaYhA4Zh3N5fV%2BZ4PU%2BnzicdHh%2BmLEfueMHng6ZJGAVqBGFZKVux%2FJXiBs%3D"; sync_networkid=5cdce000e4b0e75fae7407dd; sync_userid=5fb62b49e4b0213568612588; cd=yunzhijia.com; cn=5cdce000e4b0e75fae7407dd; gl=c3fcc403-23ac-4e08-b28c-60dc53fdf1ba; gl=c3fcc403-23ac-4e08-b28c-60dc53fdf1ba; __att_token=u0ODDeHTiBi5kPkUJ0GUWE8RkvFkfJJB; Hm_lpvt_a96914087b350d1aa86c96cdbf56d5e5=1693288269; pageViewNum=4; at=849e04e9-6239-4bfe-9a2a-5778913b6fe0; uuid=6331cd17-ac0c-4a11-ae4e-8655bed673fe';
let count = 0;
// 获取云之家省接口
async function getYZJProvinces() {
  const res = await axios.get(
    `${url}/getElementList?parentId=d005&state=ENABLE&title=&pageNumber=1&limit=1000&buid=${buid}&root=1&ticket=${ticket}`,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );
  if (res.data.errorCode === 0) {
    const { data } = res.data;
    console.log(`省份长度为${data.count}`);
    // 云之家省份数据 code为编码
    const list = data.list;
    console.log("处理省更新中...");
    for (let item of list) {
      const currentData = getProvince(item.title);
      if (currentData) {
        await update(item, currentData["province_id（省份id）"]);
      } else {
        console.log(`没找到数据:${item.title}`, currentData);
      }
    }
    console.log(`成功更新省${count}条`);
    await getYZJCity();
  } else {
    throw new Error(res.data.error);
  }
}
// 获取云之家市接口
async function getYZJCity() {
  const res = await axios.get(
    `${url}/getElementList?parentId=d006&state=ENABLE&title=&pageNumber=1&limit=1000&buid=${buid}&root=1&ticket=${ticket}`,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );
  if (res.data.errorCode === 0) {
    const { data } = res.data;
    console.log(`市长度为${data.count}`);
    // 云之家市数据 code为编码
    const list = data.list;
    console.log("处理市更新中...");
    count = 0;
    for (let item of list) {
      if (item.title === "朝阳区") {
        continue;
      }
      const currentData = getCity(item.title);
      if (currentData) {
        await update(item, currentData["city_id（城市ID）"]);
      } else {
        console.log(`没找到数据:${item.title}`);
      }
    }
    console.log(`成功更新市${count}条`);
  } else {
    throw new Error(res.data.error);
  }
}
// 更新接口
async function update(prev, updateCode) {
  const res = await axios.post(
    `${url}/updateEntity?ticket=${ticket}`,
    {
      buid,
      code: updateCode,
      id: prev.id,
      parentId: prev.parentId,
      postNodeIds: [],
      root: 1,
      showCode: prev.showCode,
      sort: prev.sort,
      title: prev.title,
    },
    {
      headers: {
        Cookie: cookie,
      },
    }
  );
  if (res.data.errorCode === 0) {
    count++;
  } else {
    throw new Error(
      JSON.stringify({
        error: res.data.error,
        data: prev,
        parentId: prev.parentId,
      })
    );
  }
}

async function init() {
  try {
    await getYZJProvinces();
  } catch (error) {
    console.log(error);
  }
}

init();
