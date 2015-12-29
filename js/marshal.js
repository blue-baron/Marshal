/*jshint browser: true, devel: true, jquery: true*/
 
function MarshalGrid(container, element, formation, gutter){
    this.formation = formation || 'bricks';
    this.container = $(container);
    this.troops = $(element);
    this.gutter = gutter || 0;
    this.breakpoints = [300, 500, 1000];
 }

MarshalGrid.prototype.enlist = function() {
    //add class to elements
    var className = this.formation;
    if (className.charAt(className.length-1) === 's') { 
        className = className.substr(0, className.length-1); 
    }
    for (var i = 0; i < this.troops.length; i++) {
        this.troops[i].className += ' marshal_' + className;  
    }//end for
};

MarshalGrid.prototype.setBreakpoints = function(width, smlVal, medVal, lrgVal, xLrgVal){
            
    //determine value of a given variable depending on the width breakpoint
    var variable;
    if (width < this.breakpoints[0]) {
        variable = smlVal;
    } else if (width < this.breakpoints[1]) {
        variable = medVal;
    } else if (width < this.breakpoints[2]) {
        variable = lrgVal;
    } else {
        variable = xLrgVal;	
    }
    return variable;
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
			// - 1 is to compensate for rounding issues when new width is calculated
			var containerWidth = this.container.width();
            var widthFactor = (containerWidth - 1) / currentRow.width;
            
			//calculate new width of each element within the row
			var newWidth;
                for(j = 0; j < currentRow.elements.length; j++) {
					if (this.elementsPerRow === 1) {
                        $(currentRow.elements[j]).width(containerWidth) ;
					} else {
                        newWidth = currentRow.elements[j].calcWidth * widthFactor;
				        if (currentRow.elements.length < perRow) {
                            newWidth = newWidth / perRow * currentRow.elements.length;
                            }
                        $(currentRow.elements[j]).width(newWidth) ;
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
        
        //postition first row jQuery position()
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


