<template>
  <div class ="main">
    <h1>Habitica Parser</h1>
   
   
   <div class="form">
      <label for="name">User ID</label>
      <input type="text"
             class="form-control" id="user-id"
             required v-model="userid"
             name="user-id">
    </div>

    <div class="form">
      <label for="name">User API Token</label>
      <input type="password"
             class="form-control" id="userapi"
             required v-model="userapi"
             name="userapi">
    </div>
  </div>

  <button v-on:click="Submit">Submit</button>

  <div id="chart">
  </div>

</template>

<script>
import http from "../http.js"
import Papa from 'papaparse'
import ApexCharts from 'apexcharts'

export default {
  name: 'Main',
  userid: "",
  userapi: "",
  historycsv: "",
  dailies: [],

  methods: {
    Submit() {

      http.get("",
              { headers:{
                'x-client': this.userid+"-HabiticaParser",
                'x-api-user': this.userid,
                'x-api-key': this.userapi
                }
        })
        .then(response =>{
          console.log("Success");
          this.historycsv = response.data
          this.Show();
        })
        .catch(err =>{
          console.log('GET histoy.csv failed :', err);
        });

    },

    Show(){
      // Get Dailies from past 7 days, their title and Ids -->  titles[], dailyIds
      var historyJson= Papa.parse(this.historycsv,{ delimiter: ',', skipEmptyLines: true }).data;
      var i;
      var dailies=[];
      var dailyIDs=[];
      var titles=[];
      for(i = 1; i < historyJson.length; i++){
        var date = new Date(historyJson[i][3]);
        if ( historyJson[i][2] == "daily"
            && date > this.pastWeek() ){
          var daily = historyJson[i];
          dailies.push(daily);
          if(dailyIDs.indexOf(daily[1]) == -1){ //If daily's ID not in the list of IDs
            dailyIDs.push(daily[1]);
            titles.push(daily[0])
          }
        }
      } 

      // Get values of dailies --> values[]
      var weekDays = this.pastDays();
      var allValues=[]
      for (let d in dailyIDs){ // for each different daily IDs
        var values=[];
        for(let k in weekDays ){ // for each day of the past week
          for(let e in dailies){ // for each entry in dailies
            date = new Date(dailies[e][3]);
            if( dailies[e][1] == dailyIDs[d]  
                && this.sameDay(date,weekDays[k]) ){
                  values.push(Math.round(parseFloat(dailies[e][4])));
            }
          }
        }
        
        if(values.length > 0){
          allValues.push(values);
          console.log(values)
        }
      }

      // Gather relevant info for drawing chart
      var series=[];
      for(let d in dailyIDs){
        var entry={
          name: titles[d],
          data: allValues[d]
        }
        series.push(entry);
      }

      var categories=[];
      for(let k in weekDays){
        categories.push(this.formatDate(weekDays[k]));
      }

      var options = {
        plotOptions: {
          heatmap: {
            colorScale: {
              ranges: [{
                from: -50,
                to: -17,
                color: '#c11916',
                name: 'extremely low',
              },
              {
                from: -16,
                to: -9,
                color: '#ed683c',
                name: 'very low',
              },
              {
                from: -8,
                to: -2,
                color: '#f3903f',
                name: 'low',
              },
              {
                from: -1,
                to: 1,
                color: '#fff33b',
                name: 'medium',
              },
              {
                from: 2,
                to: 5,
                color: '#1bf118',
                name: 'high',
              },
              {
                from: 6,
                to: 11,
                color: '#31db92',
                name: 'very high',
              },
              {
                from: 12,
                to: 30,
                color: '#1c6ff8',
                name: 'extremely high',
              }]
            }
          }
        },

        series: series,
        xaxis:{
          categories,
        },
        chart: {
          height: 450,
          type: 'heatmap',
        },
        dataLabels: {
          enabled: false
        },
        colors: ["#808080"],
        title: {
          text: 'Dailies of past 7 days'
        },
      }

      var chart = new ApexCharts(document.querySelector("#chart"), options);
      chart.render();

    },
    


    // Utility Functions
    
    pastDays(){
      // Return the 7 past days
      var pastDays= [];
      var i;

      for(i = 1; i < 8 ; i++){
        var date= new Date();
        var pastDate = date.getDate() - i;
        date.setDate(pastDate);
        pastDays.push(date);
      }
      return pastDays;
    },

    pastWeek(){
      // return the date 7 days prior
      var ourDate = new Date();

      //Change it so that it is 7 days in the past.
      var pastDate = ourDate.getDate() - 7;
      ourDate.setDate(pastDate);
      return ourDate;
    },

    sameDay(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    },
    formatDate(date){
      const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let formatted_date = date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear()
      return formatted_date;
    },
  }
}

    

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main{
  padding: 0.5em
}
label{
  padding: 1em
}
.form{
  padding: 0.2em
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
