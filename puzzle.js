$(function(){
   var result = [];
   var generalContent = [];
   
   var welcomeContent = [];
   var welcomeIndex = 0;
   
   $("#container > div").each(function(i){
      generalContent.push($(this).html()); 
   });
   
   loadWelcomeScreen();
   
   //PART - 1 : WELCOME SCREEN
   function loadWelcomeScreen()
   {
        $("#container").html(generalContent[0]);
        $("#welcome p").each(function(i){
            welcomeContent.push("<p>" + $(this).html() + "</p>");
        });
   

        $("#welcome").html(welcomeContent[welcomeIndex]);

        var timer = setInterval( welcomeAnimation, 2000) ;

        function welcomeAnimation()
        {
            welcomeIndex++;
            if(welcomeIndex === welcomeContent.length)
                welcomeIndex = 0;
            $("#welcome p").animate({opacity:0}, 400, function()
            {
                $("#welcome").html(welcomeContent[welcomeIndex]);
                $("#welcome p").css("opacity",0).animate({opacity:1},400);
            })
        }
        
        $(".button").mouseenter(function(){
            $(this).animate({padding:"20px 30px"}, 300); 
        }).mouseleave(function(){
            $(this).stop(0).animate({padding:"10px 20px"}, 300)
        }).click(function()
        {
            clearInterval(timer);             
            loadPuzzleSelectionScreen();
        });
   }
    
    //PART - 2 : PUZZLE SELECTION
    function loadPuzzleSelectionScreen()
    {
        var selectedImage = "";
        
        $("#container").fadeOut(400,function(){
            
            $(this).html(generalContent[1]).fadeIn(400);
            
            $("#puzzle_album div").css("opacity","0.5").mouseover(function(){
               $(this).animate({opacity:1}, 400); 
            }).mouseleave(function(){
               $(this).stop().animate({opacity:0.5}, 400); 
            }).click(function(){
                selectedImage = $(this).css("background-image");                
                selectedImage = selectedImage.replace('url(','').replace(')','').replace(/\"/gi, "");
                
                $("#puzzle_album div").css("width","200px").css("height","200px").css("box-shadow","0px 0px");
                $(this).css("width","220px").css("height","220px").css("box-shadow","5px 10px");
                $(".button").fadeIn(400);
            });

            $(".button").fadeOut(0).mouseenter(function(){
            $(this).animate({padding:"20px 30px"}, 300); 
             }).mouseleave(function(){
                 $(this).stop(0).animate({padding:"10px 20px"}, 300)
             }).click(function(){
                loadGameScreen(selectedImage);
             });
       });
    }
    
    //PART - 3 : PUZZLE GAME
    function loadGameScreen(selectedImageSrc)
    {
            var game = ["empty", "piece1", "piece2", "piece3", "piece4", "piece5", "piece6", "piece7", "piece8"];
            var emptyPosition = 0;
            var possibleMoves = [];
            var shuffleCount = 0;
            var shuffleTimer;
            var shuffleTimerSpeed;
            var solutionTimer;
            var lastEmptyPosition = -1;
            var solution = [];        
            var isPlayable = true;
            
            $("#container").fadeOut(400,function(){
            $("#container").html(generalContent[2]).fadeIn(400);
            $(".button").fadeOut(0).mouseenter(function(){
                $(this).animate({padding:"20px 30px"}, 300);
            }).mouseleave(function(){
                $(this).stop(0).animate({padding:"10px 20px"}, 300)
            }).click(function(e){
                shuffleCount = $("#gameInfo select option:selected").val();
                shuffleTimerSpeed = 3000 / shuffleCount;
                shuffleTimer = setInterval(shuffle, shuffleTimerSpeed);
                $("#gameInfo").html("")
            });
            
            $("#gameInfo select").on('change',function(){
                if($("#gameInfo select option:selected").val() == 0)
                    $(".button").hide();
                else
                    $(".button").show(0);
            });
            

            //calculating possible moves for each piece
            for(var i = 0; i < 9; i++)
            {
                var moves = [];
                if( i % 3 == 0)
                    moves.push(i + 1);
                else if(i % 3 == 2)
                    moves.push(i - 1);
                else
                {
                    moves.push(i - 1);
                    moves.push(i + 1);
                }
                if(parseInt(i / 3) == 0)
                    moves.push(i + 3);
                else if(parseInt(i / 3) == 2)
                    moves.push(i - 3);
                else
                {
                    moves.push(i + 3);
                    moves.push(i - 3);                    
                }
                possibleMoves.push(moves);
            }
            
            var contentHtml = "";
            for(var i = 1; i < 9; i++)
            {
                contentHtml += '<div class="puzzlePiece" ';
                contentHtml += 'id="' + game[i] + '"';
                contentHtml += 'style="position:absolute;background-image:url(' + selectedImageSrc + ');';
                contentHtml += 'background-position-x:' + parseInt((i % 3) * -150) + 'px;';
                contentHtml += 'left:' + parseInt((i % 3) * 150) + 'px;';
                contentHtml += 'background-position-y:' + (450 - (parseInt(i / 3) * 150)) + 'px;';
                contentHtml += 'top:' + + (parseInt(i / 3) * 150) + 'px;';
                contentHtml += '"></div>';                
            }      
            
            $('#game').html(contentHtml);
            
            $(window).keydown(function(e){                
                if(e.which === 27 && !isGameFinished())
                {
                    var initial = [];
                    for(var i = 0; i < 9; i++)
                    {
                        if(game[i] === "empty")
                            initial[i] = 0;
                        else
                            initial[i] = parseInt(game[i][game[i].length -1]);
                    }
                    $("#gameInfo").html("<p>CALCULATING THE BEST SOLUTION...</p>")
                    solve(initial, [0,1,2,3,4,5,6,7,8], result, function(){
                        //after solve functions finds a solution, it calls this function
                        solutionTimer = setInterval(solveAnimation, 200);
                        $("#gameInfo p").html("Move count : " + result.length);
                    });
                    
                }
                else if(e.which === 113 && !isGameFinished())//F2 to take back all moves
                {
                    solutionTimer = setInterval(takeBackAnimation, 200);
                }
            });

            $("#game").mouseleave(function(){
               $("#game div").css("opacity","1"); 
            });
            function takeBackAnimation()
            {                
                $("#game").unbind();
                $("#game div").unbind().css("opacity","1");
                if(solution.length === 0)
                {
                    clearInterval(solutionTimer);
                    gameFinish();                    
                }
                var movingIndex = solution.pop();
                var newPos = calculatePosition(emptyPosition);
                $("#" + game[movingIndex]).animate({left:newPos[0], top:newPos[1]}, 200);
                var temp = movingIndex;
                game[emptyPosition] = game[movingIndex];
                game[temp] = "empty";
                emptyPosition = temp;
                
            }
            function solveAnimation()
            {
                $("#game").unbind();
                $("#game div").unbind().css("opacity","1");
                if(result.length === 0)
                {
                    clearInterval(solutionTimer);
                    gameFinish();
                    
                }
                else
                {
                    var str = result.shift();
                    var move;
                    if(str === "right")
                        move = -1;
                    else if(str === "left")
                        move = 1;
                    else if(str === "up")
                        move = 3;
                    else
                        move = -3;
                    var movingIndex = emptyPosition + move;
                    var newPos = calculatePosition(emptyPosition);
                    $("#" + game[movingIndex]).animate({left:newPos[0], top:newPos[1]}, 200);
                    var temp = game.indexOf(game[movingIndex]);
                    game[emptyPosition] = game[movingIndex];
                    game[temp] = "empty";
                    emptyPosition = temp;
                    console.log(result);
                }
            }
            function shuffle()
            {
                if( shuffleCount <= 0)
                {
                    play();
                    $("#gameInfo").html('<p>SOLVE PUZZLE NOW</p><p style="font-size:20px">ESC to automatic solve<br>F2 to take back all moves</p>');
                    $("#gameInfo p").fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
                    clearInterval(shuffleTimer);
                }
                else
                {
                    possibleMoveCount = possibleMoves[emptyPosition].length;
                    //Select a random possible move but avoid selecting the previous move.
                    do
                    {
                        randomMove = Math.floor(Math.random() * possibleMoveCount);
                        randomMove = possibleMoves[emptyPosition][randomMove];                        
                    } while(lastEmptyPosition === randomMove);
                    
                    lastEmptyPosition = emptyPosition;
                    solution.push(emptyPosition);
                    
                    var newPos = calculatePosition(emptyPosition);
                    $("#" + game[randomMove]).animate({left:newPos[0], top:newPos[1]}, shuffleTimerSpeed);
                    var temp = game.indexOf(game[randomMove]);
                    game[emptyPosition] = game[randomMove];
                    game[temp] = "empty";
                    emptyPosition = temp;
                    shuffleCount--;
                }
            }
            function play()
            { 
                $("#game").mouseover(function()
                {
                    $("#game div").css("opacity","0.5");
                    for(var i = 0; i < possibleMoves[emptyPosition].length; i++)
                        $("#" + game[possibleMoves[emptyPosition][i]]).css("opacity", "1");
                });
                
                $('#game div').unbind();
                
                for(var i = 0; i < possibleMoves[emptyPosition].length; i++)
                    $("#" + game[possibleMoves[emptyPosition][i]]).click(function()
                        {                            
                            if(isPlayable)
                            {
                                solution.push(emptyPosition);
                                isPlayable = false;
                                var newPos = calculatePosition(emptyPosition);
                                $(this).animate({left:newPos[0], top:newPos[1]}, 400, function() { isPlayable = true; });
                                var temp = game.indexOf($(this).attr("id"));
                                game[emptyPosition] = $(this).attr("id");
                                game[temp] = "empty";
                                emptyPosition = temp;
                                if(isGameFinished())
                                    gameFinish();
                                else
                                    play();
                        }
                    });
            }
            function calculatePosition(index)
            {
                return [parseInt((index % 3) * 150), (parseInt(index / 3) * 150)];
            }
            function isGameFinished()
            {
                if(game[0].localeCompare("empty") != 0)
                    return false;
                for(var i = 1; i < 9; i++)
                    if(game[i].localeCompare("piece" + i) != 0)
                        return false;
                return true;
            }
            function gameFinish()
            {
                $("#game").unbind();
                $("#game div").unbind().css("opacity","1");
                
                var newStr = '<p id="congrat">Congratulations!</p>';
                newStr += '<p id="restart">F5 to restart</p>';
                $("#gameInfo").html(newStr);
                $("#congrat").fadeOut(500).fadeIn(500)
                        .animate({"top":"-400px"},700,function(){
                            $("#restart").animate({"font-size":"100px","left":"170px"}, 500)
                                        .animate({"font-size":"50px","left":"290px"}, 500);
                })
                        .animate({"font-size":"100px","left":"70px"}, 500)
                        .animate({"top":"-420px"},500)
                        .animate({"top":"-380px"},500)
                        .animate({"top":"-400px"},500);
            }
        });
    }
});