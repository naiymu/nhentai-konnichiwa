// ==UserScript==
// @name         K-NHentai
// @author       naiymu
// @version      1.0.1
// @license      MIT; https://raw.githubusercontent.com/naiymu/k-nhentai/main/LICENSE
// @namespace    https://github.com/naiymu/k-nhentai
// @homepage     https://github.com/naiymu/k-nhentai
// @downloadURL  https://github.com/naiymu/k-nhentai/raw/main/k-nhentai.user.js
// @updateURL    https://github.com/naiymu/k-nhentai/raw/main/k-nhentai.user.js
// @supportURL   https://github.com/naiymu/k-nhentai/issues
// @description   A simple usercript for downloading doujinshi from NHentai and mirrors 
// @match        https://nhentai.net/*
// @match        https://nhentai.xxx/*
// @match        https://nyahentai.red/*
// @match        https://nhentai.to/*
// @match        https://nhentai.website/*
// @connect      nhentai.net
// @connect      i3.nhentai.net
// @connect      cdn.nhentai.xxx
// @connect      nhentai.com
// @connect      t.dogehls.xyz
// @grant        GM_addStyle
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @icon         https://raw.githubusercontent.com/naiymu/k-nhentai/main/assets/icon.png
// ==/UserScript==

GM_addStyle (
`
.relative {
  position: relative !important;
}

.download-check {
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  height: 20px;
  width: 20px;
  accent-color: #ed2553;
}

.download-check:focus,
.download-check:hover {
  box-shadow: 0 0 10px 0 #ed2553;
}

.red-box {
  background-color: #ed2553;
  color: white;
  border: none;
  outline: none;
  font-size: 16px;
  width: 50px;
  height: 35px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.check-center {
  display: flex!important;
  align-items: center!important;
  justify-content: center!important;
  text-align: center;
}

.red-box {
  cursor: pointer;
}

.red-box:hover {
  background-color: #4d4d4d;
}

.red-box>i,
.red-box>.download-check {
  margin-right: 5px;
}

.red-box>.download-check {
  accent-color: #1f1f1f;
}

.red-box>.download-check:focus,
.red-box>.download-check:hover {
  box-shadow: none;
}

.red-box:disabled {
  background-color: #1f1f1f;
  cursor: default;
}

.download-div {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.div-horizontal {
  flex-direction: row !important;
}

.fa-spinner,
.fa-circle-notch {
  animation: spin 1.5s infinite linear;
}

@keyframes spin {
  100% {transform: rotate(359deg)};
}

.red-box>.download-check {
  position: relative;
}

.config-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 999999;
  visibility: hidden;
}

.visible {
  visibility: visible;
}

.config-div {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  max-width: 850px;
  max-height: 480px;
  padding: 50px;
  transform: translate(-50%, -50%);
  background-color: #1f1f1f;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: scroll;
}

.config-element-div {
  width: 100%;
  display: inline-grid;
  grid: auto / 200px auto;
  margin-bottom: 15px
}

.config-element-div>input {
  color: #000 !important;
}

.config-element-div>label {
  grid-column-start: 1;
}

.config-element-div>input[type='checkbox'] {
  justify-self: left;
}

.config-element-div>*:not(label) {
  grid-column-start: 2;
  border-radius: 0;
  border: none;
  background-color: #d9d9d9 !important;
}

.config-btn-div {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.config-reset:hover {
  cursor: pointer;
  color: #ed2553;
}

.heading {
  width: 100%;
  border-bottom: solid 1px #d9d9d9;
  text-align: left;
}
`
);

const apis = {
    net: "https://nhentai.net/api/gallery/",
    com: "https://nhentai.com/api/comics/",
}
const mediaUrls = {
    net: "https://i3.nhentai.net/galleries/",
    xxx: "https://cdn.nhentai.xxx/g/",
    hls: "https://t.dogehls.xyz/galleries/",
    com: "https://cdn.nhentai.com/nhentai/storage/images/",
}
const btnStates = {
    enabled: "<i class='fa fa-download'></i>",
    fetching: "<i id='btn-spinner' class='fa fa-spinner'></i>",
    downloading: "<i id='btn-spinner' class='fa fa-circle-notch'></i>",
    config: "<i class='fa fa-cog'></i>",
};
const methods = {
    NET: "NET",
    COM: "COM"
};
const titleFormats = {
    PR: "pretty",
    EN: "english",
    JP: "japanese",
    ID: "id",
}
const saveJSONModes = {
    NO: "Don't save",
    FI: "Save as JSON file",
    CB: "Copy to clipboard",
}
const fileNameSeps = {
    SP: "Space",
    HY: "Hyphen",
    US: "Underscore",
}
const btnOrientations = {
    VR: "Vertical",
    HR: "Horizontal",
}
const CONFIG = {
    method: {
        label: 'Domain to use',
        type: 'select',
        options: [methods.NET,methods.COM],
        default: methods.NET,
    },
    simulN: {
        label: 'Download batch size',
        type: 'int',
        min: 1,
        max: 50,
        default: 10,
    },
    titleFormat: {
        label: 'Title format',
        type: 'select',
        options: [titleFormats.PR,titleFormats.EN,titleFormats.JP,
                  titleFormats.ID],
        default: titleFormats.PR,
    },
     fileNamePrep: {
        label: 'Filename to prepend',
        type: 'text',
        size: 20,
        default: "",
    },
     fileNameSep: {
        label: 'Filename separator',
        type: 'select',
        options: [fileNameSeps.SP,fileNameSeps.HY,fileNameSeps.US],
        default: fileNameSeps.SP,
    },
    saveJSONMode: {
         label: 'Save JSON',
         type: 'select',
         options: [saveJSONModes.NO,saveJSONModes.FI,saveJSONModes.CB],
         default: saveJSONModes.NO,
     },
    includeGroups: {
        label: 'Include groups in authors',
        type: 'checkbox',
        default: false,
    },
    btnOrientation: {
        label: 'Button orientation',
        type: 'select',
        options: [btnOrientations.VR, btnOrientations.HR],
        default: btnOrientations.VR,
    }
}

// Config Options saved after download button click
var method, simulN, includeGroups, titleFormat,
    saveJSONMode, fileNamePrep, fileNameSep, btnOrientation;
// Buttons and Divs
var downloadDiv, downloadBtn, configBtn, checkAllDiv, checkAll,
    configWrapper, configDiv, saveConfigBtn, closeConfigBtn,
    resetConfigAnchor, clearDownloadBtn;
// Download info
var currentDownloads = 0;
var info = JSON.parse(GM_getValue('info') || '[]');
var queue = JSON.parse(GM_getValue('queue') || '[]');
// Config options
var configOptions = JSON.parse(GM_getValue('configOptions') || '{}');

function disableButton(btnStatus) {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = btnStatus;
}

function enableButton() {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = btnStates.enabled;
}

function createNode(element, classes=[]) {
    var node = document.createElement(element);
    for(let cls of classes) {
        node.classList.add(cls);
    }
    return node;
}

function createLabel(id, text) {
    var label = createNode('label');
    label.innerHTML = text;
    label.setAttribute('for', id);
    return label;
}

function getExtension(type) {
    switch(type) {
        case 'j': return '.jpg';
        case 'p': return '.png';
        case 'g': return '.gif';
    }
}

function updateConfig() {
    method = configOptions.method;
    simulN = configOptions.simulN;
    titleFormat = configOptions.titleFormat;
    includeGroups = configOptions.includeGroups;
    saveJSONMode = configOptions.saveJSONMode;
    fileNamePrep = configOptions.fileNamePrep;
    fileNameSep = configOptions.fileNameSep;
    btnOrientation = configOptions.btnOrientation;
}

function saveConfig(reset=false) {
    for(const [key, value] of Object.entries(CONFIG)) {
        var element = document.getElementById(`config-${key}`);
        var configValue;
        switch(value.type) {
            case 'checkbox':
                configValue = element.checked;
                break;
            case 'int':
                configValue = element.value;
                if(value.max && configValue > value.max) {
                    configValue = value.max;
                }
                if(value.min && configValue < value.min) {
                    configValue = value.min;
                }
                break;
            default:
                configValue = element.value;
        }
        configValue = reset ? value.default : configValue;
        configOptions[key] = configValue;
        element.value = configValue;
        if(value.type == 'checkbox') element.checked = configValue;
    }
    if(configOptions.btnOrientation == btnOrientations.HR) {
        downloadDiv.classList.add('div-horizontal');
    }
    else {
        downloadDiv.classList.remove('div-horizontal');
    }
    GM_setValue('configOptions', JSON.stringify(configOptions));
    updateConfig();
}

function addConfigMenu() {

    var heading = createNode('h3', ['heading']);
    heading.innerHTML = "K-Nhentai";
    configDiv.appendChild(heading);

    for(const [key, value] of Object.entries(CONFIG)) {
        var div = createNode('div', ['config-element-div']);
        var element, id, label;
        switch(value.type) {
            case 'select':
                element = createNode('select');
                for(let i=0; i<value.options.length; i++) {
                    var optionElement = createNode('option');
                    var option = value.options[i];
                    optionElement.text = option;
                    optionElement.value = option;
                    element.appendChild(optionElement);
                }
                break;
            case 'int':
                element = createNode('input');
                element.type = 'number';
                if(value.min != undefined) {
                    element.min = value.min;
                }
                if(value.max != undefined) {
                    element.max = value.max;
                }
                break;
            case 'checkbox':
                element = createNode('input');
                element.type = 'checkbox';
                break;
            case 'text':
                element = createNode('input');
                element.type = 'text';
                element.maxLength = value.size;
                element.defaultValue = value.default;
                break;
        }
        id = `config-${key}`;
        element.id = id;
        var configValue = configOptions[key]
                          ? configOptions[key]
                          : value.default;
        if(value.type == 'checkbox') {
            element.checked = configValue;
        }
        else {
            element.value = configValue;
        }
        // If key does not exist in configOptions, add it
        if(!configOptions[key]) {
            configOptions[key] = configValue;
        }
        label = createLabel(id, value.label);

        div.appendChild(label);
        div.appendChild(element);

        configDiv.appendChild(div);
        updateConfig();
    }

    var btnDiv = createNode('div', ['config-btn-div']);
    saveConfigBtn = createNode('button', ['red-box']);
    saveConfigBtn.innerHTML = "Save";
    saveConfigBtn.addEventListener('click', () => {
        saveConfig();
    });

    closeConfigBtn = createNode('button', ['red-box']);
    closeConfigBtn.innerHTML = "Close";
    closeConfigBtn.addEventListener('click', () => {
        configWrapper.classList.remove('visible');
    });

    clearDownloadBtn = createNode('a', ['config-reset']);
    clearDownloadBtn.innerHTML = "Clear and stop downloads";
    clearDownloadBtn.addEventListener('click', () => {
        queue = [];
        GM_setValue('queue', JSON.stringify(queue));
    });

    resetConfigAnchor = createNode('a', ['config-reset']);
    resetConfigAnchor.innerHTML = 'Reset to default';
    resetConfigAnchor.addEventListener('click', () => {
        saveConfig(true);
    });

    btnDiv.appendChild(saveConfigBtn);
    btnDiv.appendChild(closeConfigBtn);
    btnDiv.appendChild(clearDownloadBtn);
    btnDiv.appendChild(resetConfigAnchor);

    configDiv.appendChild(btnDiv);
}

(async function() {
    'use strict';

    configWrapper = createNode('div', ['config-wrapper']);
    configDiv = createNode('div', ['config-div']);
    configWrapper.addEventListener('click', () => {
        if(event.target != configWrapper) {
            return;
        }
        configWrapper.classList.remove('visible');
    });
    configWrapper.appendChild(configDiv);
    addConfigMenu();

    var aList = document.querySelectorAll(".gallery > a, #cover > a");
    for(let a of aList) {
        var ref = a.href;
        var parent = a.parentElement;
        var code;
        code = ref.split("/g/")[1];
        if(code.endsWith("/")) {
            code = code.split("/")[0];
        }
        var check = createNode('input', ['download-check']);
        check.type = 'checkbox';
        check.value = code;
        parent.classList.add("relative");
        parent.appendChild(check);
    }
    let classes = ['download-div'];
    if(configOptions.btnOrientation == btnOrientations.HR) {
        classes.push('div-horizontal');
    }
    downloadDiv = createNode('div', classes);

    downloadBtn = createNode('button', ['red-box']);
    enableButton();

    configBtn = createNode('button', ['red-box']);
    configBtn.innerHTML = btnStates.config;
    configBtn.addEventListener("click", (event) => {
        configWrapper.classList.add('visible');
    });

    checkAllDiv = createNode('div', ['red-box', 'relative']);
    checkAll = createNode('input', ['download-check']);
    checkAll.type = 'checkbox';
    checkAll.addEventListener('change', () => {
        let toCheck = checkAll.checked;
        let boxes = document.querySelectorAll('.download-check');
        for(let box of boxes) {
            if(box === checkAll) {
                continue;
            }
            box.checked = toCheck;
        }
    });
    checkAllDiv.appendChild(checkAll);

    downloadBtn.addEventListener("click", async () => {
        updateConfig();
        if(info.length > 0) {
            info = [];
            GM_setValue('info', JSON.stringify(info));
        }
        switch(fileNameSep) {
            case fileNameSeps.SP: fileNameSep = " "; break;
            case fileNameSeps.HY: fileNameSep = "-"; break;
            case fileNameSeps.US: fileNameSep = "_"; break;
        }

        var checked = document.querySelectorAll(".download-check:checked");
        if(checked.length > 0) {
            disableButton(btnStates.fetching);
        }
        else {
            return;
        }
        for(const c of checked) {
            var code = c.getAttribute("value");
            await addInfo(code);
            GM_setValue('info', JSON.stringify(info));
        }
        if(method == methods.COM) {
            await comPopulateQueue();
        }
        else {
            await netPopulateQueue();
        }
        GM_setValue('queue', JSON.stringify(queue));
        disableButton(btnStates.downloading);
        downloadQueue();
    });

    downloadDiv.appendChild(downloadBtn);
    downloadDiv.appendChild(configBtn);
    downloadDiv.appendChild(checkAllDiv);

    document.body.appendChild(downloadDiv);
    document.body.appendChild(configWrapper);

    if(queue.length > 0) {
        disableButton(btnStates.downloading);
        downloadQueue();
    }
})();

async function addInfo(code) {
    var apiUrl = apis.net + code;
    var res = await makeGetRequest(apiUrl);
    var obj = JSON.parse(res.responseText);
    var title;
    if(titleFormat == 'id') {
        title = `${obj.id}`;
    }
    else {
        title = obj.title[titleFormat];
        title = title.replace(/\.+$/, "");
        title = title.replace(/^\.+/, "");
    }
    var pages = obj.num_pages;
    var tagList = obj.tags;
    var artists = [];
    var tags = [];
    for(let i=0; i<tagList.length; i++) {
        let tagItem = tagList[i];
        if(tagItem.type == "artist"
            || (includeGroups && tagItem.type == "group")) {
            artists.push(tagItem.name);
        }
        if(tagItem.type == "tag") {
            tags.push(tagItem.name);
        }
    }
    var mediaPrefix, mediaUrl;
    var host = location.hostname;
    if(host == 'nhentai.xxx' || host == 'nyahentai.red') {
        mediaPrefix = mediaUrls.xxx;
    }
    else if(host == 'nhentai.to' || host == 'nhentai.website') {
        mediaPrefix = mediaUrls.hls;
    }
    else {
        mediaPrefix = mediaUrls.net;
    }
    mediaUrl = `${mediaPrefix}${obj.media_id}/`;
    const constTitleExists = info.some(el => el.title === title);
    if(constTitleExists) {
        title += " - "+code;
    }
    fileNamePrep = fileNamePrep.trim();
    var namePrep = "";
    if(fileNamePrep != "") {
        namePrep = fileNamePrep + fileNameSep;
    }
    var coverExtension = getExtension(obj.images.pages[0].t);
    await info.push({
        code: code,
        title: title,
        artists: artists,
        tags: tags,
        pages: pages,
        mediaUrl: mediaUrl,
        namePrep: namePrep,
        coverExtension: coverExtension,
        pagesInfo: obj.images.pages,
    });
}

async function addToQueue(item, mediaId=null) {
    var pages = item.pages;
    var title = item.title;
    var mediaUrl = item.mediaUrl;
    var namePrep = item.namePrep;
    for(let i=0; i<pages; i++) {
        var extension = getExtension(item.pagesInfo[i].t);
        let page = i + 1;
        var imgUrl;
        if(mediaId != null) {
            imgUrl = `${mediaUrls.com}${mediaId}/${page}${extension}`;
        }
        else {
            imgUrl = `${mediaUrl}${page}${extension}`;
        }
        await queue.push({
            page: page,
            url: imgUrl,
            title: title,
            mediaUrl:mediaUrl,
            namePrep: namePrep,
            extension: extension,
        });
    }
}

async function netPopulateQueue() {
    for(const item of info) {
        await addToQueue(item);
    }
}

async function makeGetRequest(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: (response) => {
                resolve(response);
            },
            onerror: (error) => {
                reject(error);
            }
        })
    });
}

async function comGetMediaUrl(item, slug) {
    try {
        var apiUrl = apis.com + slug;
        const response = await makeGetRequest(apiUrl);
        var obj = JSON.parse(response.responseText);
        var mediaId = obj.id;
        await addToQueue(item, mediaId);
    }
    catch(error) {
        console.error("apis.com request failed with error code"
                      +error.status
                      +". Message is "
                      +error.responseText);
    }
}

async function comInitXHR(item) {
    try {
        var code = item.code;
        var url = `https://nhentai.com/g/${code}`;
        const response = await makeGetRequest(url);
        var slug = response.finalUrl.replace(/\/$/, "");
        slug = slug.split("/").pop();
        if(slug == "404") {
            console.warn(item.title
                         +" not found on nhentai.com. "
                         +"Falling back to"
                         +location.hostname);
            await addToQueue(item);
            return;
        }
        await comGetMediaUrl(item, slug);
    }
    catch(error) {
        console.error("comSlug request failed with error code"
                      +error.status
                      +". Message is "
                      +error.responseText);
    }
}

async function comPopulateQueue() {
    for(const item of info) {
        await comInitXHR(item);
    }
}

async function downloadQueue() {
    while(queue.length > 0) {
        if(currentDownloads >= simulN) {
            await sleep(125);
            continue;
        }
        var item = queue.shift();
        GM_setValue('queue', JSON.stringify(queue));
        download(item);
    }
}

function saveJSON() {
    var data = [];
    for(var item of info) {
        data.push({
            dirName: item.title,
            dirCover: `${item.namePrep}1${item.coverExtension}`,
            authors: item.artists,
            tags: item.tags,
        });
    }
    var fileContent = {
        'directories': data
    }
    fileContent = JSON.stringify(fileContent, null, 2);
    if(saveJSONMode == saveJSONModes.CB) {
        GM_setClipboard(fileContent, 'text');
    }
    else {
        var blob = new Blob([fileContent],
                            {type: 'application/json'});
        var jsonUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var fileName = `${Date.now()}.json`;
        a.download = fileName;
        a.href = jsonUrl;
        a.click();
    }
}

function download(item) {
    const fileName = `${item.title}/${item.namePrep}${item.page}${item.extension}`;
    GM_download({
        url: item.url,
        name: fileName,
        saveAs: false,
        onerror: (error, details) => {
            // Could not download. Try again with NET
            if(method != methods.NET) {
                item.url = `${item.mediaUrl}${item.page}${item.extension}`;
            }
            queue.unshift(item);
            GM_setValue('queue', JSON.stringify(queue));
            currentDownloads--;
        },
        onload: () => {
            currentDownloads--;
            if(queue.length == 0 && currentDownloads == 0) {
                enableButton();
                if(saveJSONMode != saveJSONModes.NO) {
                    saveJSON();
                }
            }
        },
    });
    currentDownloads++;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
