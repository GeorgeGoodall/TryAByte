var inp;



function autocomplete(inp, arr, onNewEntryCallback) {
  this.inp = inp;
  this.arr = arr;
  this.callBack = onNewEntryCallback;
  this.currentFocus = null;

  this.inp.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
    }
  });

  var keyup = (function(e) {
      var x = document.getElementById(this.id + "_autocomplete-list");

      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        this.currentFocus++;
        /*and and make the current item more visible:*/
        this.addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        this.currentFocus--;
        /*and and make the current item more visible:*/
        this.addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (this.currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x){
            x[this.currentFocus].click();
            this.currentFocus = -1;
          }

        }else{// the user has entered a new item, add this new item to the list
          let id = this.inp.id.split("_");
          onNewEntryCallback(this.inp.value, id[id.length-1]);
        }
      } else {
        var char = String.fromCharCode(event.keyCode);
        if (/[a-zA-Z0-9-_ ]/.test(char) || event.keyCode == 8 || event.keyCode == 46){
            var a, b, i, val = this.inp.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            this.currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "_autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.inp.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.values.length; i++) {
              let item = arr.values[i].name + ":" + arr.values[i].price;
              /*check if the item starts with the same letters as the text field value:*/
              if (val.length == 0 || item.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + item.substr(0, val.length) + "</strong>";
                b.innerHTML += item.substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + item + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    this.currentFocus = -1;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
              }
            }
        }
      }
    }).bind(this);

  var focus = (function(e){
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "_autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.inp.parentNode.appendChild(a);

    this.currentFocus = -1;

    /*for each item in the array...*/
    for (i = 0; i < arr.values.length; i++) {
      let item = arr.values[i].name + ":" + arr.values[i].price;
      /*create a DIV element for each matching element:*/
      b = document.createElement("DIV");
      /*make the matching letters bold:*/
      b.innerHTML += item;
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + item + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
      });
      a.appendChild(b);
    }
  }).bind(this);

  this.inp.addEventListener("keyup", keyup);

  

  this.inp.addEventListener("focus", focus);

  this.inp.addEventListener("blur",function(e){
    closeAllLists();
  });

  this.addActive = function(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    this.removeActive(x);
    if (this.currentFocus >= x.length) this.currentFocus = 0;
    if (this.currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[this.currentFocus].classList.add("autocomplete-active");
  }
  this.removeActive = function(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  this.autocompleteSetArray = function(arrr){
    arr = arrr;
  }
 
}

function closeAllLists(elmnt) {
  /*close all autocomplete lists in the document,
  except the one passed as an argument:*/
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    //if (elmnt != x[i] && elmnt != inp) {
    if (elmnt != x[i]) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}


