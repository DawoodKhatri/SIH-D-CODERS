var ipoptions = document.getElementById("iplangs")
var opoptions = document.getElementById("oplangs")
var action = document.getElementById("action")
var translate = document.getElementById("translate")
var clear = document.getElementById("clear")
var listen = document.getElementById("listen")
var pfile = document.getElementById("pick")
var save = document.getElementById("save")
var output = document.getElementById("txtarea")
var undo = document.getElementById("undo")
var redo = document.getElementById("redo")
var fname = document.getElementById("name")
var talert = document.getElementById("alert")
talert.style.visibility = "hidden"
temp = ""
stack = ['']
var host = window.location.href
    // var host = "http://127.0.0.1:5000"
    // window.jsPDF = window.jspdf.jsPDF

var ipevent = new Event('input')

var speech = new webkitSpeechRecognition()
speech.interimResults = true

for (i = 0; i < Languages.length; i++) {
    var option = document.createElement("option");
    option.text = Languages[i]["name"]
    option.value = Languages[i]["code"]
    ipoptions.add(option);
    var option = document.createElement("option");
    option.text = Languages[i]["name"]
    option.value = Languages[i]["code"]
    opoptions.add(option);
}

speech.lang = ipoptions.selectedOptions[0].value

ipoptions.addEventListener('change', () => {
    // output.value = ""
    // output.dispatchEvent(ipevent)
    // temp = ""
    speech.lang = ipoptions.selectedOptions[0].value
})

action.addEventListener('click', () => {
    if (output.value) {
        temp = output.value + " "
    }
    speech.start()
})

clear.addEventListener('click', () => {
    output.value = ""
    output.dispatchEvent(ipevent)
})

listen.addEventListener('click', () => {
    getAudio(output.value, ipoptions.selectedOptions[0].value)
})

translate.addEventListener('click', () => {
    getTranslation(output.value, ipoptions.selectedOptions[0].value, opoptions.selectedOptions[0].value)
})

output.addEventListener('input' || 'change' || 'paste', () => {
    pushStack(output.value)
})


undo.addEventListener('click', () => {
    if (undo.value > 0 && undo.value < stack.length) {
        undo.value = undo.value - 1
        redo.value = undo.value
        output.value = stack[undo.value]
    }
})

redo.addEventListener('click', () => {
    if (redo.value >= 0 && redo.value < stack.length - 1) {
        redo.value = redo.value - (-1)
        undo.value = redo.value
        output.value = stack[redo.value]
    }
})


pfile.addEventListener('click', () => {
    if (pfile.innerText == "Use Audio File") {
        let input = document.createElement('input')
        input.type = 'file'
        input.onchange = e => {
            let files = Array.from(input.files)
            getTranscription(files[0], ipoptions.selectedOptions[0].value)
        }
        input.click();
    }
})

save.addEventListener('click', () => {
    if (fname.value != "") {
        var dl = document.createElement('a')
        dl.href = window.URL.createObjectURL(new Blob([output.value], { type: "text/plain" }))
        dl.download = fname.value
        dl.click()
        fname.value = ""
    } else {
        showAlert("Please Enter File Name")
    }

})

speech.addEventListener('audiostart', (e) => {
    action.innerText = "Listening..."
})

speech.addEventListener('audioend', (e) => {
    action.innerText = "Start Listening"
})

speech.addEventListener('result', (e) => {
    var text = ""
    var i = 0
    while (e.results[0].length > i) {
        text += e.results[i][0].transcript
        i++
    }
    output.value = temp + text
    output.dispatchEvent(ipevent)
})

function showAlert(message) {
    talert.innerText = message
    talert.style.visibility = "visible"
    setTimeout(() => {
        talert.style.visibility = "hidden"
    }, 3000);
}

function pushStack(text) {
    stack.push(text)
    undo.value = stack.length - 1
    redo.value = stack.length - 1
        // for (i = stack.length - 1; i > undo.value; i--) {
        //     console.log(i)
        // }
}

function getTranslation(text, l1, l2) {

    var data = {}
    data["Text"] = text
    data["From"] = l1
    data["To"] = l2

    translate.innerText = "Translating..."
    fetch(host + "translate", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        res.text().then(d => {
            translate.innerText = "Translate"
            if (!d.includes("<!DOCTYPE HTML ")) {
                output.value = d
                output.dispatchEvent(ipevent)
                ipoptions.selectedIndex = opoptions.selectedIndex
            } else {
                showAlert("Error Translating")
            }
        })
    }).catch(() => {
        translate.innerText = "Translate"
        showAlert("Error Translating")
    })
}

function getTranscription(file, lang) {

    var data = new FormData();
    data.append('file', file, lang);
    pfile.innerText = "Analysing Audio..."
    fetch(host + "transcript", {
        method: "POST",
        body: data
    }).then(res => {
        res.text().then(d => {
            pfile.innerText = "Use Audio File"
            if (!d.includes("<!DOCTYPE HTML ")) {
                output.value = d
                output.dispatchEvent(ipevent)
            } else {
                showAlert("Error Analysing Audio")
            }
        })
    }).catch(() => {
        pfile.innerText = "Use Audio File"
        showAlert("Error Analysing Audio")
    })
}

function getAudio(text, lang) {
    var data = {}
    data["Text"] = text
    data["Lang"] = lang

    fetch(host + "listen", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        res.blob().then(b => {
            var audio = new Audio(window.URL.createObjectURL(b))
            audio.play();
        })
    }).catch(() => {
        showAlert("Error")
    })

}

// function savePDF(txt, name) {
//     var pdf = new jsPDF()
//     pdf.addFont('./aakar-medium.ttf', 'aakar-medium', 'normal')
//     pdf.setFont('aakar-medium')
//     text = pdf.splitTextToSize(txt, 180)
//     len = text.length
//     pdf.text(15, 15, text.slice(0, 43))
//     len = len - 43
//     i = 43
//     while (len >= 0) {
//         pdf.addPage()
//         pdf.text(15, 15, text.slice(i, i + 43))
//         i = i + 43
//         len = len - 43
//     }
//     pdf.save(name)

// }