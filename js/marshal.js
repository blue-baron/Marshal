/*jshint browser: true, devel: true, jquery: true*/
 
function MarshalGrid(container, element, formation, gutter){
    this.formation = formation || 'bricks';
    this.container = $(container);
    this.troops = $(element);
    this.gutter = gutter || 10;
    this.breakpoints = [300, 500, 1000];
 }

MarshalGrid.prototype.enlist = function() {
    //add class name to formation wrapper
    this.container.addClass('marshal_wrapper');
   
    //add class to elements
    var troopName = this.formation;
    if (troopName.charAt(troopName.length-1) === 's') { 
        troopName = troopName.substr(0, troopName.length-1); 
    }
    for (var i = 0; i < this.troops.length; i++) {
        this.troops[i].className += ' marshal_' + troopName;  
    }//end for
};

MarshalGrid.prototype.setBreakpoints = function(width, smlVal, medVal, lrgVal, xLrgVal){
            
    //determine value of a current breakpoint depending on the given widths
    var breakpoint;
    if (width < this.breakpoints[0]) {
        breakpoint = smlVal;
    } else if (width < this.breakpoints[1]) {
        breakpoint = medVal;
    } else if (width < this.breakpoints[2]) {
        breakpoint = lrgVal;
    } else {
        breakpoint = xLrgVal;	
    }
    return breakpoint;
};


MarshalGrid.prototype.perRow = function() {
    //determine number of elements in each row based on wrapper width and breakpoints
    this.elementsPerRow = this.setBreakpoints(this.container.width(), 1, 2, 3, 4);
};
    
MarshalGrid.prototype.bricks = function(mobile, medium, large) {
		
    this.rows = {};
    var rows = this.rows;
       
    rows.row = [];
    var row = this.rows.row;
    
    this.perRow('bricks', mobile, medium, large);
    var perRow = this.elementsPerRow;
        
    //determine number of rows and push elements into corresponding row objects
    var self = this;
    (function() {
        var numberRows = Math.ceil(self.troops.length / perRow);
        var rowIndex = 0;
        for (var i = 1; i <= numberRows; i++) {
            var singleRow = self.troops.slice(rowIndex, (rowIndex + perRow));
            self.rows.row.push( { elements: singleRow } );
                
            rowIndex = rowIndex + self.elementsPerRow;
            }
        })();//end IIFE   
        
        for (var i = 0; i < row.length; i++) {
            var width = 0;
            var currentRow = row[i];
            
            //determine current width of each row
            var j;
            for(j = 0; j < currentRow.elements.length; j++) {
				
                var element = currentRow.elements[j];
                var calcWidth = element.offsetWidth / (element.offsetHeight / 100);
                element.calcWidth = calcWidth;
                
                width = width + calcWidth;
			 	}//end for var j
            currentRow.width = width;
			
			//determine factor to multiply width by
			var totalGutter = this.gutter * (this.elementsPerRow - 1);
        //totalCardsWidth = this.container.width() - totalGutter;
    //this.dimensions.cardWidth = Math.floor(totalCardsWidth / this.elementsPerRow);
    
            var containerWidth = this.container.width() - totalGutter;
            var widthFactor = (containerWidth) / currentRow.width;
            
			//calculate new width and heights and position bricks accordingly
			var newWidth,
                leftPos = 0,
                topPos;
                for(j = 0; j < currentRow.elements.length; j++) {
					//calculate new width of element
                    var brick = currentRow.elements[j];
                        if (this.elementsPerRow === 1) {
                        $(brick).width(containerWidth) ;
					} else {
                        newWidth = brick.calcWidth * widthFactor;
				        if (currentRow.elements.length < perRow) {
                            newWidth = newWidth / perRow * currentRow.elements.length;
                            }
                        $(brick).width(newWidth);
                        }
                    //calculate new height of element based on recalculated width.
                    currentRow.rowHeight = $(brick).height();
                
                    //absolute position left with jQuery position()
                    $(brick).css('left', leftPos);
                    leftPos += (brick.width + this.gutter);
                    
                    //absolute position top with jQuery position()
                    if (i === 0) {
                        $(brick).css('top', 0);
                        if (j === (currentRow.elements.length - 1)) {
                            topPos = (currentRow.rowHeight + this.gutter); 
                        }
                    } else {
                        $(brick).css('top', topPos);
                        if (j === (currentRow.elements.length - 1)) {
                            topPos += (currentRow.rowHeight + this.gutter);   
                        }
                    }
                    
                   
                }//end for var j
            
		}//end for var i
    
};//end bricks


MarshalGrid.prototype.cards = function(){
     
    this.dimensions = { cardHeights: [], topPositions: [] };    
    this.perRow();
            
    //determine individual card width less gutter (in px)
    var totalGutter = this.gutter * (this.elementsPerRow - 1),
        totalCardsWidth = this.container.width() - totalGutter;
    this.dimensions.cardWidth = Math.floor(totalCardsWidth / this.elementsPerRow);
    
    //set width of cards & then get resized heights
    //Use to position. Store column heights in array, updating with each row
    var i;
    for (i = 0; i < this.troops.length; i++) {
            
        var card = $(this.troops[i]);    
        card.width(this.dimensions.cardWidth);
        this.dimensions.cardHeights[i] = card.height();
        
        //postition first row with jQuery position()
        if (i < this.elementsPerRow) {
            var leftPosition = (this.dimensions.cardWidth + this.gutter) * i;
            card.css('top', 0);
            card.css('left', leftPosition);
                
            var cardPosition = card.position();
            this.dimensions.topPositions[i] = cardPosition.top;
        } 
        //position subsequent rows
        //determine the previous card in the column and position the next card accordingly.   
        else {
            var prevIndex = i - this.elementsPerRow;
            var prevCard = $(this.troops[prevIndex]);
            var prevCardPosition = prevCard.position();
            var thisCardTop = prevCard.height() + prevCardPosition.top + this.gutter;
            var thisCardLeft = prevCardPosition.left;   
        
            card.css('top', thisCardTop);
            card.css('left', thisCardLeft);
            
            var cardOffset = card.position();
            this.dimensions.topPositions[i] = cardOffset.top;
            
            }    
        }//end for 
        
        //set height for wrapper to be the height of the longest column
        var columnHeight = 0;
        var cardPos = this.dimensions.topPositions;
        
        for (i = cardPos.length - 1; i >= cardPos.length - this.elementsPerRow; i--) {
            var pos = cardPos[i] + this.dimensions.cardHeights[i];
            if (pos > columnHeight) {
                columnHeight = pos;
            }
        }
        this.container.height(columnHeight);
      
};//end cards



//Initialize cards grid formation.
	var cardGrid = new MarshalGrid('#cards_wrapper', '.card', 'cards', 10);
	cardGrid.breakpoints = [400, 600, 950];
	cardGrid.enlist();
	cardGrid.cards();
	$('#cards_wrapper').css('visibility', 'visible');
	
	//Resize cards on window resize.
	$(window).resize(function() {
    cardGrid.cards();
    }); 
    
    //Initialize bricks grid formation.
var bricksGrid = new MarshalGrid('#bricks_wrapper', '.brick', 'bricks', 20);
	bricksGrid.breakpoints = [400, 600, 950];
	bricksGrid.enlist();
	bricksGrid.bricks();
	$('#bricks_wrapper').css('visibility', 'visible');
	
	//Resize bricks on window resize.
	$(window).resize(function() {
    bricksGrid.bricks();
    });