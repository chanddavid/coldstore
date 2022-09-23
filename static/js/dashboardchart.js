window.addEventListener('load', (e) => {
    e.preventDefault();
    console.log("dashboard clicked")
    $.ajax({
        url: "dashboard_chart/",
        type: 'get',
        dataType: 'json',
        success: function (data) {
            for (let i = 0; i <data.length; i++) {
                organization = data[i]['organization']
                freeze_id = data[i]['freeze_id']
                device_Name = data[i]['device_Name']
                DashboardChart(device_Name, freeze_id, organization,`myChart${i}`)
            }
        }
    })
})


function DashboardChart(device_Name, freeze_id, organization,canvasId) {
    console.log(organization, freeze_id, device_Name,canvasId)

    const client = new Paho.MQTT.Client("10.10.5.82", 9002, "Temperature_Inside" + new Date().getTime())
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({ onSuccess: onConnect });
    function onConnect() {
        console.log("onConnect");
        client.subscribe(`${organization}/${freeze_id}/${device_Name}/temperature`);

    }

    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
        client.connect({ onSuccess: onConnect });
    }


    function onMessageArrived(message) {
        console.log("onMessageArrived:" + message.payloadString);
        const msg = message.payloadString
        let realdata = JSON.parse(msg)["temp"]
        let device_id = JSON.parse(msg)["d_id"]
        let Threshold = JSON.parse(msg)['c_temp']
        console.log(realdata, device_id, Threshold)

        dataobjNew = dataobj['data']['datasets'][0]['data'];
        dataobjNew.shift();
        dataobjNew.push(realdata)
        dataobj['data']['datasets'][0]['data'] = dataobjNew
        myLine.update();

        dataobjNew1 = dataobj['data']['datasets'][1]['data'];
        dataobjNew1.shift();
        dataobjNew1.push(Threshold)
        dataobj['data']['datasets'][1]['data'] = dataobjNew1
        myLine.update();
    }
    function onClose() {
        console.log("disconnected")

    }
    let dataobj = {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

            datasets: [{
                label: 'Temperature',
                borderColor: "rgb(220,20,60)",
                borderWidth: 2,
                backgroundColor: "rgba(255,99,132,0.2)",
                data: [65, 59, 80, 81, 30, 23, 54, 12, 23, 34],
                tension: 0.4,
                pointRadius: 1,
                fill: false,
                animation: true,
            },
            {
                borderColor: "#F7BA11",
                label: 'Threshold',
                borderWidth: 2,
                pointRadius: 0,
                data: [26, 26, 26, 26, 26, 26, 26, 26, 26, 26],
                animation: false,
                fill: false
            }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temperature'
                    }
                },
                x: {
                    beginAtZero: true
                },
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: device_Name
                    }
                }]
            },

        },

    }
    var myLine = null
    var ctx = document.getElementById(canvasId).getContext('2d');
    myLine = new Chart(ctx, dataobj);
}