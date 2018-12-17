import React, { Component } from 'react';
import Combinatorics from 'js-combinatorics';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      matches: [],
      players: [],
      teams: [],
      filters: []
    }
    this.totalCredits = 100;
    this.min_batsmen = 3;
    this.max_batsmen = 5;
    this.min_bowlers = 3;
    this.max_bowlers = 5;
    this.min_allrounders = 1;
    this.max_allrounders = 3;
    this.min_wicket_keepers = 1;
    this.max_wicket_keepers = 1;
    this.min_players_same_team = 4;
    this.max_players_same_team = 7;
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ matches: res.matches }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/matches');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    console.log(body);
    return body;
  };

  handleChange = (index) => {
    var that = this;
    console.log(that.state.players[index].isSelected);
    that.state.players[index].isSelected = !that.state.players[index].isSelected;
    that.setState({ players: that.state.players });
    that.generateTeams();
    //that.setState({ that.state.players[index].isSelected: !that.state.players[index].isSelected });
  }

  // combine = (input, len, start) =>{
  //   var that = this;
  //     if(len === 0) {
  //       console.log(this.teams);
  //       console.log(this.teams.join(" ") ); //process here the result
  //       that.state.teams.push(this.teams);
  //       that.setState({ teams: that.state.teams });
  //       return;
  //     }
  //     for (var i = start; i <= input.length - len; i++) {
  //       this.teams[this.teams.length - len] = input[i];
  //       this.combine(input, len-1, i+1 );
  //     }
  // }

  checkConstraints = (team) => {
    var batsmen_count = 0;
    var bowler_count = 0;
    var wicket_keeper_count = 0;
    var all_rounder_count = 0;
    var player_credits = 0;
    var teams_count = {};
    for(var i=0;i<team.length;i++){
      console.log(team[i]);
      if(teams_count[team[i].squad.id])
        teams_count[team[i].squad.id]++;
      else
        teams_count[team[i].squad.id] = 1;
      player_credits+=team[i].credits;
      switch(team[i].type.name){
        case 'ALL':
         all_rounder_count++;
         break;
        case 'BAT':
         batsmen_count++;
         break;
        case 'BOWL':
         bowler_count++;
         break;
        case 'WK':
         wicket_keeper_count++;
         break;
        default:
         break;
      }
    }
    if(batsmen_count<this.min_batsmen || batsmen_count >this.max_batsmen)
      return false;
    if(bowler_count<this.min_bowlers || bowler_count >this.max_bowlers)
      return false;
    if(all_rounder_count<this.min_allrounders || all_rounder_count >this.max_allrounders)
      return false;
    if(wicket_keeper_count<this.min_wicket_keepers || wicket_keeper_count >this.max_wicket_keepers)
      return false;
    if(player_credits>this.totalCredits)
      return false;
    for (var key in teams_count) {
      if (teams_count.hasOwnProperty(key)) {
        var player_count = teams_count[key];
        if(player_count<this.min_players_same_team || player_count>this.max_players_same_team)
          return false;
      }
    }
    console.log(batsmen_count);
    console.log(bowler_count);
    console.log(wicket_keeper_count);
    console.log(all_rounder_count);
    console.log(player_credits);
    console.log(teams_count);
    return true;
  }

  generateTeams = () => {
    var that = this;
    var players = that.state.players.filter(player=>player.isSelected);
    console.log(players);
    if(players.length<11)
      return;
      //console.log("less number of players");
    var cmb = Combinatorics.combination(players, 11);
    var a=[];
    that.state.teams = [];
    while(a = cmb.next()) {
      var constraintsSatisfied = that.checkConstraints(a);
      if(constraintsSatisfied)
        that.state.teams.push(a);
    }
    console.log(that.state.teams);
    that.setState({ teams: that.state.teams });

    //that.combine( players, this.teams.length, 0);
  }

  handleClick = (matchId,tourId) => {
    var that= this;
    console.log(matchId);
    // console.log('this is:', this);
    // const response = fetch('/api/players');
    // const body = response.json();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        var data = JSON.parse(this.responseText);
        that.setState({ players: data.players });
        //document.getElementById("demo").innerHTML = this.responseText;
      }
    };
    xhttp.open("GET", "/api/players?matchId="+matchId+"&tourId="+tourId, true);
    xhttp.send();
    // fetch('/api/players?matchID=')
    //   .then(data => data.json())
    //   .then((data) => { console.log(data);this.setState({ players: data.players }) }); 

    // if (response.status !== 200) throw Error(body.message);
    // console.log(body);
    //return body;
  }


  render() {
    var that = this;
    return (
       <div id="main-container" className=".fluid-container">
       <Header></Header>
       <div id="match-player-container" className="sub-container">
         <table className="table table-striped table-dark">
         <thead>
          <tr><th scope="col">#</th><th scope="col">Match</th><th scope="col">Match ID</th><th scope="col">Tour ID</th><th scope="col">Option</th></tr></thead>
          <tbody>
           {this.state.matches.map(function(item,index){
              return (<Match key={index} item = {item} id={index} handleClick={this.handleClick}></Match>)
            }.bind(this))}
            </tbody>
         </table>
         <table className="table table-striped table-dark">
         <thead>
          <tr><th scope="col">#</th><th scope="col">Player</th><th scope="col">Player ID</th><th scope="col">Type</th><th scope="col">Option</th></tr></thead>
          <tbody>
           {this.state.players.map(function(item,index){
              return (<Player key={index} item = {item} id={index} handleChange={this.handleChange}></Player>)
            }.bind(this))}
            </tbody>
         </table>
         </div>
         <div id="teams-container" className="sub-container">
         <Teams teams={that.state.teams}></Teams>
         </div>
       </div>
    );
  }
}

class Match extends Component {
  render() {
    return (
     <tr>
     <th scope="row">{this.props.id + 1}</th>
     <td>{this.props.item.name}</td>
     <td>{this.props.item.id}</td>
     <td>{this.props.item.tour.id}</td>
     <td><button onClick={ () => this.props.handleClick(this.props.item.id,this.props.item.tour.id) }>List Players</button></td>
     </tr>
    )
  }
}

class Player extends Component {

  render() {
    return (
     <tr>
     <th scope="row">{this.props.id + 1}</th>
     <td>{this.props.item.name}</td>
     <td>{this.props.item.id}</td>
     <td>{this.props.item.type.name}</td>
     <td> <input type="checkbox" onClick={ () => this.props.handleChange(this.props.id) } defaultChecked={this.props.item.isSelected}/></td>
     </tr>
    )
  }
}

class Teams extends Component {
  render() {
    console.log("inside teams");
    console.log(this.props.teams);
    return (
    <div>
       {this.props.teams.map(function(team,index){
              return (<Team key={index} team = {team} id={index}></Team>)
        }.bind(this))}
        </div>
    )
  }
}

class Team extends Component {

  render() {
    console.log("inside team");
    console.log(this.props.team);
    return (
     <table className="table table-striped table-dark">
         <thead>
          <tr><th>No.</th><th>Player</th><th>Player ID</th><th>Type</th><th>Option</th></tr></thead>
          <tbody>
           {this.props.team.map(function(player,index){
              return (<Player key={index} item = {player} id={index}></Player>)
            }.bind(this))}
            </tbody>
         </table>
    )
  }
}

class Header extends Component {

  render() {
    return(
      <ul>
      <li><a className="active" href="#home">Home</a></li>
      <li><a href="#news">News</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#about">About</a></li>
      </ul>
    )
 }
}