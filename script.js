(function (global){
    'use strict';
if (window.confirm("Начать игру?")) { 
    function randomInt(min, max) {
        if (arguments.length < 2) {
            max = min;
            min = 0;
        } 
        return Math.floor(Math.random() * (max - min )) + min;
    }

    function Game (robot, field, gameTime){
        this.robot = robot;
        this.field = field;
        this.renderGameTime = function (second,endMinute,endHour,endDay,endMonth,endYear) {            
            var now = new Date();
            second = (arguments.length == 1) ? second + now.getSeconds() : second;
            endYear =  typeof(endYear) != 'undefined' ?  endYear : now.getFullYear();            
            endMonth = endMonth ? endMonth - 1 : now.getMonth();   
            endDay = typeof(endDay) != 'undefined' ? endDay :  now.getDate();    
            endHour = typeof(endHour) != 'undefined' ?  endHour : now.getHours();
            endMinute = typeof(endMinute) != 'undefined' ? endMinute : now.getMinutes();  
            var endDate = new Date(endYear,endMonth,endDay,endHour,endMinute,second+1); 
            var self = this;
            var interval = setInterval(function() { 
                var time = endDate.getTime() - now.getTime();
                if (time < 0) {                      
                    clearInterval(interval);
                    alert("Неверная дата!");            
                } else {            
                    var minutes = Math.floor(time / 6e4) % 60;
                    var seconds = Math.floor(time / 1e3) % 60;  
                    document.getElementById('clockdiv').innerHTML =  minutes + ' : '+ seconds;
                    if (!seconds && !minutes) {              
                        clearInterval(interval);                        
                        alert('Ваш счет: '+ game.robot.lifes);                      
                        self.toLocalStorage();                                    
                        self.end();                                             
                    }           
                }
                now.setSeconds(now.getSeconds() + 1);
            }, 1000);
        };
        this.renderRobotLifes = function (robotLifes) {
            if (this.robot.lifes) { 
                document.getElementById('robotLifes').innerHTML = '<img src="img/heart.png" alt="Жизней :">   ' + this.robot.lifes;
            } else {this.end ()}
        };
        this.renderBestScore = function () {
            var score = localStorage.getItem('score');
            document.getElementById('BestScore').innerHTML = '<img src="img/best1.png" alt="Лучший результат :">   '+score;
        };
        this.end = function () {
            document.getElementById('robot').style.background='url(img/deadRobot.png) 100% no-repeat black';
            location.reload();
        };
    };

    Game.prototype.toLocalStorage = function () {
        var score = localStorage.getItem('score');
        if (score < this.robot.lifes) localStorage.setItem('score', this.robot.lifes);  
    };

    Game.prototype.makeHeartsAndBombs = function () {
        var self = this;
        setInterval(function() {
            self.makeHearts();
            self.makeBombs();
        }, 1200);
    };

    Game.prototype.makeHearts = function () {
        var divID = randomInt(0, 24);
        var isDivIDFree = this.field.checkIsFieldElemEmpty(divID);                            
        if (isDivIDFree === 'empty') {  
            this.field.makeFieldElemFull(divID);                                              
            var heartDiv = document.getElementById(divID);
            var heart = document.createElement('div');
            heart.style.background= 'url(img/heart.png) center no-repeat';
            heart.style.height='inherit';
            heart.id='h' + divID;
            heart.className= divID;
            heartDiv.appendChild(heart);  
            this.destroyHeartsAndBombs(heart.id, divID, 3000); 
        } 
    };
        
    Game.prototype.makeBombs = function () {        
        var bombDivID =  randomInt(0, 24); 
        var isDivIDFree =  this.field.checkIsFieldElemEmpty(bombDivID);                                  
        if (isDivIDFree === 'empty') {             
            this.field.makeFieldElemFull(bombDivID);  
            var bombDiv = document.getElementById(bombDivID);
            var bombHTML = document.createElement('p');    
            bombHTML.id= 'b'+ bombDivID;
            bombHTML.className= bombDivID;;
            bombDiv.appendChild(bombHTML);  
            var time = randomInt(4000, 5000);
            this.destroyHeartsAndBombs(bombHTML.id, bombDivID, time); 
        } 
    };

    Game.prototype.destroyHeartsAndBombs = function (elem, divID, time) {   
        var self = this;
        setTimeout(function() {
            var b = document.getElementById(elem);
            if (b) {
                b.parentNode.removeChild(b);
                self.field.makeFieldElemEmpty(divID);                                  
            }            
        }, time);    
    };

    Game.prototype.checkMoveArrows = function() {
        var self = this;
        document.onkeydown = function() {
            var oldRobotPosition = self.robot.position;
            var newPosition;
            var lefter = [0, 5, 10, 15, 20];
            var righter = [4, 9, 14, 19, 24];
            var toper = [0, 1, 2, 3, 4];
            var bottomer = [20, 21, 22, 23, 24] ;

            if (event.code == 'ArrowLeft') { 
                var itog = lefter.some(checkMove);
                newPosition = oldRobotPosition-1;
                self.makeRobotMove(itog, newPosition);   


            } else if (event.code == 'ArrowRight') {              
                var itog = righter.some(checkMove);
                newPosition= oldRobotPosition+1;
                self.makeRobotMove(itog, newPosition);


            } else if (event.code == 'ArrowUp') {   
                var itog = toper.some(checkMove);
                newPosition = oldRobotPosition-5;
                self.makeRobotMove(itog, newPosition);                
                 

            } else if (event.code == 'ArrowDown') { 
                var itog = bottomer.some(checkMove);
                newPosition = oldRobotPosition+5;
                self.makeRobotMove(itog, newPosition);   
            };

            function checkMove (element, index, arr){
                return oldRobotPosition == element;
            }; 
        };  
    };
    
    Game.prototype.makeRobotMove = function(itog, newPosition) {
        if (itog) {
            this.robot.changeRobotMood('sad');
            this.robotDie();        
        } else{
            this.robot.position = newPosition; 
            this.renderRobot(this.robot.position);
        };    
    };

    Game.prototype.renderRobot = function(position) { 
        var robot = document.getElementById('robot');
        if (robot == null) {
            var div = document.getElementById(position); 
            var robot = document.createElement('div');     
            robot.id = 'robot';   
            div.appendChild(robot); 

            var FieldElem = this.field.checkIsFieldElemEmpty(position);            
            if (FieldElem === 'full') {
               var whatIsInsideFieldElem =  this.field.whatIsInsideFieldElem(position);   
                if (whatIsInsideFieldElem == 'heart') {   
                    var HeartID = this.field.insideID(position);  
                    this.robotCatchHeart(HeartID);
                    this.field.makeFieldElemEmpty(position);                                                 
                } else  if(whatIsInsideFieldElem == 'bomb'){ 
                    var BombID = this.field.insideID(position);                                        
                    this.robot.changeRobotMood('dead');
                    this.robotDie(BombID);
                    this.field.makeFieldElemEmpty(position);
                } ;
            }            
        } else if (robot) {           
            robot.parentNode.removeChild(robot);                                                  
            this.renderRobot(this.robot.position);
        };        
    };

    Game.prototype.robotCatchHeart = function(ElemID) {
            this.robot.changeRobotMood('life');
            this.robot.lifes ++;
            this.renderRobotLifes(this.lifes);        
            document.getElementById(ElemID).parentNode.removeChild(document.getElementById(ElemID));
    };

    Game.prototype.robotDie = function(ElemID) {            
            this.robot.lifes --;
            this.renderRobotLifes(this.lifes); 
            if (ElemID) document.getElementById(ElemID).parentNode.removeChild(document.getElementById(ElemID));
    };    

    function Field (){
        this.width = 5;
        this.height = 5;
        this.elem = [];
    };
    
    Field.prototype.renderField = function () {
        var parent = document.getElementById('field');
        var num = this.width * this.height;     
        for (var i = 0; i < num; i++) {            
            var div = document.createElement('div');
            div.id = i;
            div.className = 0;
            this.elem.push(div);
            parent.appendChild(div);            
        }         
    };

    Field.prototype.checkIsFieldElemEmpty = function(position) {     
        if (this.elem[position].className == '1') {return 'full';} 
        else {return 'empty';}
    };
    Field.prototype.whatIsInsideFieldElem = function(position) {  
        if (this.elem[position].firstChild.tagName == 'P') {return 'bomb'}
        else if (this.elem[position].firstChild.tagName == 'DIV') {return 'heart'};
    };
    Field.prototype.insideID = function(position) {  
        return this.elem[position].firstChild.id;
    };

    Field.prototype.makeFieldElemFull = function(divID) {
        document.getElementById(divID).className = "1";
    };
    Field.prototype.makeFieldElemEmpty = function(divID) {
        document.getElementById(divID).className = "0";
    };

    function Robot(name, lifes, position, field) {
        this.name = name;
        this.lifes = lifes; 
        this.position = position; 
        this.field = field;        
    }
    
    Robot.prototype.changeRobotMood = function (mood) {
        var mood = mood;
        if (mood == 'sad') document.getElementById('robot').style.background='url(img/sadRobot.png) 100% 100% no-repeat #00CED1';
        else if (mood == 'dead') document.getElementById('robot').style.background='url(img/deadRobot.png) 100% no-repeat #00CED1';
        else if (mood == 'life') document.getElementById('robot').style.background='url(img/lifeRobot.png) 100% 100% no-repeat #C71585';
    };   
    


        var field1 = new Field();
        field1.renderField();

        var robot1 = new Robot('Грег', 1, 2, field1);

        var game= new Game(robot1, field1, 1000 );
        game.renderRobot(2);
        game.checkMoveArrows();
        game.makeHeartsAndBombs();
        game.renderGameTime(30);
        game.renderRobotLifes();
        game.renderBestScore();
};
}(window));
