document.addEventListener('DOMContentLoaded', function(){
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("keydown", function(event){
            var key = event.key;
            if (key === "Backspace"){
                this.value = "";
            }
            else if (key > 0 && key < 10){
                this.value = key;
            }
            else{
                event.preventDefault();
            }
        });
        inputs[i].addEventListener("input", function(){
            if (this.value == 0){
                this.value = "";
            }
            if (this.value.length > 1){
                if (this.value[0] == 0){
                    this.value = this.value.slice(1);
                }
                else{
                    this.value = this.value.slice(0, 1);
                }
            }
        });
    }
});

class Square {
    constructor(assignment, name){
        this.assignment = Number(assignment);
        if (this.assignment == 0){
            this.assignment = "";
        }
        this.name = name;
        if (assignment != ""){
            this.possible_values = new Set([this.assignment]);
        }
        else{
            this.possible_values = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        }
    }
}

class Group {
    constructor(squares, name){
        this.squares = squares; // List of squares
        this.name = name;
    }
    check_conflicting_numbers(){
        for (let i = 0; i < this.squares.length; i++){
            if (this.squares[i].assignment != ""){
                for (let j = 0; j < this.squares.length; j++){
                    if (j != i && this.squares[j].assignment == this.squares[i].assignment){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

// Select the variable that has the smallest domain
function select_unassigned_square(all_squares){
    let min_length = 10;
    let min_square = null;
    for (let square of all_squares){
        if (square.assignment == "" && square.possible_values.size < min_length){
            min_length = square.possible_values.size;
            min_square = square;
        }
    }
    return min_square;
}

function check_assignment_complete(all_squares){
    for (let square of all_squares){
        if (square.assignment == ""){
            return false;
        }
    }
    return true;
}

function check_failure(all_squares){
    for (let square of all_squares){
        if (square.possible_values.size == 0){
            return true;
        }
    }
    return false;
}

// Check which groups assignments belong to. input:list of assignments. output: set of groups
function find_groups(assignment_list, groups){
    let group_set = new Set();
    for (let a of assignment_list){
        for (let g of groups){
            for (let s of g.squares){
                if (a == s){
                    group_set.add(g);
                    break;
                }
            }
        }
    }
    return group_set;
}


function infer(groups, all_squares, all_groups){
    let new_assignments = [];
    let changes_to_domain = [];
    let continue_looping = true;
    let groups_to_iterate = groups;
    while (continue_looping){
        continue_looping = false;
        for (let group of groups_to_iterate){
            for (let i = 0; i < 9; i++){
                if (group.squares[i].assignment != ""){
                    for (let j = 0; j < 9; j++){
                        if (j != i && group.squares[j].possible_values.has(group.squares[i].assignment)){
                            group.squares[j].possible_values.delete(group.squares[i].assignment);
                            let counter = 0;
                            for (let c of changes_to_domain){
                                if (c[0] == group.squares[j]){
                                    c[1].add(group.squares[i].assignment);
                                    counter++;
                                }
                            }
                            if (counter == 0){
                                changes_to_domain.push([group.squares[j], new Set([group.squares[i].assignment])]);
                            }
                        }
                    }
                }
            }
        }
        if (check_failure(all_squares)){
            return ["failure", new_assignments, changes_to_domain];
        }
        let new_assignments_this_cycle = [];
        for (let square of all_squares){
            if (square.assignment == "" && square.possible_values.size == 1){
                let v = square.possible_values.values();
                square.assignment = v.next().value;
                new_assignments.push(square);
                new_assignments_this_cycle.push(square);
                continue_looping = true;
            }
        }
        if (continue_looping){
            groups_to_iterate = find_groups(new_assignments_this_cycle, all_groups);
        }
    }
    return ["success", new_assignments, changes_to_domain];
}

function backtrack(groups, all_squares){
    if (check_assignment_complete(all_squares)){
        return "success";
    }
    let selected_square = select_unassigned_square(all_squares);
    for (let value of selected_square.possible_values){
        let selected_square_previous_domain = selected_square.possible_values;       
        selected_square.assignment = value;
        selected_square.possible_values = new Set([value]);
        let groups_to_infer = find_groups([selected_square], groups);
        let inferences = infer(groups_to_infer, all_squares, groups);
        if (inferences[0] == "failure"){
            selected_square.assignment = "";
            selected_square.possible_values = selected_square_previous_domain;
            for (let a of inferences[1]){
                a.assignment = "";
            }
            for (let c of inferences[2]){
                for(let v of c[1]){
                    c[0].possible_values.add(v);
                }
            }
            continue;
        }
        let result = backtrack(groups, all_squares);
        if (result != "failure"){
            return result;
        }
        selected_square.assignment = "";
        selected_square.possible_values = selected_square_previous_domain;
        for (let a of inferences[1]){
            a.assignment = "";
        }
        for (let c of inferences[2]){
            for(let v of c[1]){
                c[0].possible_values.add(v);
            }
        }
    }
    return "failure";
}

function solution(){

    var fb = document.getElementById("feedback");
    fb.innerHTML = "Solving...";

    var r1c1 = new Square(document.getElementById("r1c1").value, "r1c1");
    var r1c2 = new Square(document.getElementById("r1c2").value, "r1c2");
    var r1c3 = new Square(document.getElementById("r1c3").value, "r1c3");
    var r1c4 = new Square(document.getElementById("r1c4").value, "r1c4");
    var r1c5 = new Square(document.getElementById("r1c5").value, "r1c5");
    var r1c6 = new Square(document.getElementById("r1c6").value, "r1c6");
    var r1c7 = new Square(document.getElementById("r1c7").value, "r1c7");
    var r1c8 = new Square(document.getElementById("r1c8").value, "r1c8");
    var r1c9 = new Square(document.getElementById("r1c9").value, "r1c9");

    var r2c1 = new Square(document.getElementById("r2c1").value, "r2c1");
    var r2c2 = new Square(document.getElementById("r2c2").value, "r2c2");
    var r2c3 = new Square(document.getElementById("r2c3").value, "r2c3");
    var r2c4 = new Square(document.getElementById("r2c4").value, "r2c4");
    var r2c5 = new Square(document.getElementById("r2c5").value, "r2c5");
    var r2c6 = new Square(document.getElementById("r2c6").value, "r2c6");
    var r2c7 = new Square(document.getElementById("r2c7").value, "r2c7");
    var r2c8 = new Square(document.getElementById("r2c8").value, "r2c8");
    var r2c9 = new Square(document.getElementById("r2c9").value, "r2c9");

    var r3c1 = new Square(document.getElementById("r3c1").value, "r3c1");
    var r3c2 = new Square(document.getElementById("r3c2").value, "r3c2");
    var r3c3 = new Square(document.getElementById("r3c3").value, "r3c3");
    var r3c4 = new Square(document.getElementById("r3c4").value, "r3c4");
    var r3c5 = new Square(document.getElementById("r3c5").value, "r3c5");
    var r3c6 = new Square(document.getElementById("r3c6").value, "r3c6");
    var r3c7 = new Square(document.getElementById("r3c7").value, "r3c7");
    var r3c8 = new Square(document.getElementById("r3c8").value, "r3c8");
    var r3c9 = new Square(document.getElementById("r3c9").value, "r3c9");

    var r4c1 = new Square(document.getElementById("r4c1").value, "r4c1");
    var r4c2 = new Square(document.getElementById("r4c2").value, "r4c2");
    var r4c3 = new Square(document.getElementById("r4c3").value, "r4c3");
    var r4c4 = new Square(document.getElementById("r4c4").value, "r4c4");
    var r4c5 = new Square(document.getElementById("r4c5").value, "r4c5");
    var r4c6 = new Square(document.getElementById("r4c6").value, "r4c6");
    var r4c7 = new Square(document.getElementById("r4c7").value, "r4c7");
    var r4c8 = new Square(document.getElementById("r4c8").value, "r4c8");
    var r4c9 = new Square(document.getElementById("r4c9").value, "r4c9");

    var r5c1 = new Square(document.getElementById("r5c1").value, "r5c1");
    var r5c2 = new Square(document.getElementById("r5c2").value, "r5c2");
    var r5c3 = new Square(document.getElementById("r5c3").value, "r5c3");
    var r5c4 = new Square(document.getElementById("r5c4").value, "r5c4");
    var r5c5 = new Square(document.getElementById("r5c5").value, "r5c5");
    var r5c6 = new Square(document.getElementById("r5c6").value, "r5c6");
    var r5c7 = new Square(document.getElementById("r5c7").value, "r5c7");
    var r5c8 = new Square(document.getElementById("r5c8").value, "r5c8");
    var r5c9 = new Square(document.getElementById("r5c9").value, "r5c9");

    var r6c1 = new Square(document.getElementById("r6c1").value, "r6c1");
    var r6c2 = new Square(document.getElementById("r6c2").value, "r6c2");
    var r6c3 = new Square(document.getElementById("r6c3").value, "r6c3");
    var r6c4 = new Square(document.getElementById("r6c4").value, "r6c4");
    var r6c5 = new Square(document.getElementById("r6c5").value, "r6c5");
    var r6c6 = new Square(document.getElementById("r6c6").value, "r6c6");
    var r6c7 = new Square(document.getElementById("r6c7").value, "r6c7");
    var r6c8 = new Square(document.getElementById("r6c8").value, "r6c8");
    var r6c9 = new Square(document.getElementById("r6c9").value, "r6c9");

    var r7c1 = new Square(document.getElementById("r7c1").value, "r7c1");
    var r7c2 = new Square(document.getElementById("r7c2").value, "r7c2");
    var r7c3 = new Square(document.getElementById("r7c3").value, "r7c3");
    var r7c4 = new Square(document.getElementById("r7c4").value, "r7c4");
    var r7c5 = new Square(document.getElementById("r7c5").value, "r7c5");
    var r7c6 = new Square(document.getElementById("r7c6").value, "r7c6");
    var r7c7 = new Square(document.getElementById("r7c7").value, "r7c7");
    var r7c8 = new Square(document.getElementById("r7c8").value, "r7c8");
    var r7c9 = new Square(document.getElementById("r7c9").value, "r7c9");

    var r8c1 = new Square(document.getElementById("r8c1").value, "r8c1");
    var r8c2 = new Square(document.getElementById("r8c2").value, "r8c2");
    var r8c3 = new Square(document.getElementById("r8c3").value, "r8c3");
    var r8c4 = new Square(document.getElementById("r8c4").value, "r8c4");
    var r8c5 = new Square(document.getElementById("r8c5").value, "r8c5");
    var r8c6 = new Square(document.getElementById("r8c6").value, "r8c6");
    var r8c7 = new Square(document.getElementById("r8c7").value, "r8c7");
    var r8c8 = new Square(document.getElementById("r8c8").value, "r8c8");
    var r8c9 = new Square(document.getElementById("r8c9").value, "r8c9");

    var r9c1 = new Square(document.getElementById("r9c1").value, "r9c1");
    var r9c2 = new Square(document.getElementById("r9c2").value, "r9c2");
    var r9c3 = new Square(document.getElementById("r9c3").value, "r9c3");
    var r9c4 = new Square(document.getElementById("r9c4").value, "r9c4");
    var r9c5 = new Square(document.getElementById("r9c5").value, "r9c5");
    var r9c6 = new Square(document.getElementById("r9c6").value, "r9c6");
    var r9c7 = new Square(document.getElementById("r9c7").value, "r9c7");
    var r9c8 = new Square(document.getElementById("r9c8").value, "r9c8");
    var r9c9 = new Square(document.getElementById("r9c9").value, "r9c9");

    var r1 = new Group([r1c1, r1c2, r1c3, r1c4, r1c5, r1c6, r1c7, r1c8, r1c9], "r1");
    var r2 = new Group([r2c1, r2c2, r2c3, r2c4, r2c5, r2c6, r2c7, r2c8, r2c9], "r2");
    var r3 = new Group([r3c1, r3c2, r3c3, r3c4, r3c5, r3c6, r3c7, r3c8, r3c9], "r3");
    var r4 = new Group([r4c1, r4c2, r4c3, r4c4, r4c5, r4c6, r4c7, r4c8, r4c9], "r4");
    var r5 = new Group([r5c1, r5c2, r5c3, r5c4, r5c5, r5c6, r5c7, r5c8, r5c9], "r5");
    var r6 = new Group([r6c1, r6c2, r6c3, r6c4, r6c5, r6c6, r6c7, r6c8, r6c9], "r6");
    var r7 = new Group([r7c1, r7c2, r7c3, r7c4, r7c5, r7c6, r7c7, r7c8, r7c9], "r7");
    var r8 = new Group([r8c1, r8c2, r8c3, r8c4, r8c5, r8c6, r8c7, r8c8, r8c9], "r8");
    var r9 = new Group([r9c1, r9c2, r9c3, r9c4, r9c5, r9c6, r9c7, r9c8, r9c9], "r9");

    var c1 = new Group([r1c1, r2c1, r3c1, r4c1, r5c1, r6c1, r7c1, r8c1, r9c1], "c1");
    var c2 = new Group([r1c2, r2c2, r3c2, r4c2, r5c2, r6c2, r7c2, r8c2, r9c2], "c2");
    var c3 = new Group([r1c3, r2c3, r3c3, r4c3, r5c3, r6c3, r7c3, r8c3, r9c3], "c3");
    var c4 = new Group([r1c4, r2c4, r3c4, r4c4, r5c4, r6c4, r7c4, r8c4, r9c4], "c4");
    var c5 = new Group([r1c5, r2c5, r3c5, r4c5, r5c5, r6c5, r7c5, r8c5, r9c5], "c5");
    var c6 = new Group([r1c6, r2c6, r3c6, r4c6, r5c6, r6c6, r7c6, r8c6, r9c6], "c6");
    var c7 = new Group([r1c7, r2c7, r3c7, r4c7, r5c7, r6c7, r7c7, r8c7, r9c7], "c7");
    var c8 = new Group([r1c8, r2c8, r3c8, r4c8, r5c8, r6c8, r7c8, r8c8, r9c8], "c8");
    var c9 = new Group([r1c9, r2c9, r3c9, r4c9, r5c9, r6c9, r7c9, r8c9, r9c9], "c9");

    var b1 = new Group([r1c1, r1c2, r1c3, r2c1, r2c2, r2c3, r3c1, r3c2, r3c3], "b1");
    var b2 = new Group([r1c4, r1c5, r1c6, r2c4, r2c5, r2c6, r3c4, r3c5, r3c6], "b2");
    var b3 = new Group([r1c7, r1c8, r1c9, r2c7, r2c8, r2c9, r3c7, r3c8, r3c9], "b3");
    var b4 = new Group([r4c1, r4c2, r4c3, r5c1, r5c2, r5c3, r6c1, r6c2, r6c3], "b4");
    var b5 = new Group([r4c4, r4c5, r4c6, r5c4, r5c5, r5c6, r6c4, r6c5, r6c6], "b5");
    var b6 = new Group([r4c7, r4c8, r4c9, r5c7, r5c8, r5c9, r6c7, r6c8, r6c9], "b6");
    var b7 = new Group([r7c1, r7c2, r7c3, r8c1, r8c2, r8c3, r9c1, r9c2, r9c3], "b7");
    var b8 = new Group([r7c4, r7c5, r7c6, r8c4, r8c5, r8c6, r9c4, r9c5, r9c6], "b8");
    var b9 = new Group([r7c7, r7c8, r7c9, r8c7, r8c8, r8c9, r9c7, r9c8, r9c9], "b9");

    var groups = [r1, r2, r3, r4, r5, r6, r7, r8, r9, c1, c2, c3, c4, c5, c6, c7, c8, c9, b1, b2, b3, b4, b5, b6, b7, b8, b9];
    var rows = [r1, r2, r3, r4, r5, r6, r7, r8, r9];
    var columns = [c1, c2, c3, c4, c5, c6, c7, c8, c9];
    var boxes = [b1, b2, b3, b4, b5, b6, b7, b8, b9];

    for (let group of rows){
        if (group.check_conflicting_numbers()){
            fb.innerHTML = "Cannot be solved. Identical numbers in a row.";
            return;
        }
    }
    for (let group of columns){
        if (group.check_conflicting_numbers()){
            fb.innerHTML = "Cannot be solved. Identical numbers in a column.";
            return;
        }
    }
    for (let group of boxes){
        if (group.check_conflicting_numbers()){
            fb.innerHTML = "Cannot be solved. Identical numbers in a box.";
            return;
        }
    }

    var all_squares = [r1c1, r2c1, r3c1, r4c1, r5c1, r6c1, r7c1, r8c1, r9c1,
        r1c2, r2c2, r3c2, r4c2, r5c2, r6c2, r7c2, r8c2, r9c2,
        r1c3, r2c3, r3c3, r4c3, r5c3, r6c3, r7c3, r8c3, r9c3,
        r1c4, r2c4, r3c4, r4c4, r5c4, r6c4, r7c4, r8c4, r9c4,
        r1c5, r2c5, r3c5, r4c5, r5c5, r6c5, r7c5, r8c5, r9c5,
        r1c6, r2c6, r3c6, r4c6, r5c6, r6c6, r7c6, r8c6, r9c6,
        r1c7, r2c7, r3c7, r4c7, r5c7, r6c7, r7c7, r8c7, r9c7,
        r1c8, r2c8, r3c8, r4c8, r5c8, r6c8, r7c8, r8c8, r9c8,
        r1c9, r2c9, r3c9, r4c9, r5c9, r6c9, r7c9, r8c9, r9c9];
    
    var original_assignments = []
    for (let square of all_squares){
        if (square.assignment != ""){
            original_assignments.push(square);
        }
    }

    var original_group_set = find_groups(original_assignments, groups);
    let inference = infer(original_group_set, all_squares, groups);
    if (inference[0] == "failure"){
        fb.innerHTML = "No solution found.";
        return;
    }
  
    if (backtrack(groups, all_squares) == "failure"){
        fb.innerHTML = "No solution found.";
        return;
    }

    fb.innerHTML = "Solved!";

    document.getElementById("r1c1").value=r1c1.assignment;
    document.getElementById("r1c2").value=r1c2.assignment;
    document.getElementById("r1c3").value=r1c3.assignment;
    document.getElementById("r1c4").value=r1c4.assignment;
    document.getElementById("r1c5").value=r1c5.assignment;
    document.getElementById("r1c6").value=r1c6.assignment;
    document.getElementById("r1c7").value=r1c7.assignment;
    document.getElementById("r1c8").value=r1c8.assignment;
    document.getElementById("r1c9").value=r1c9.assignment;

    document.getElementById("r2c1").value=r2c1.assignment;
    document.getElementById("r2c2").value=r2c2.assignment;
    document.getElementById("r2c3").value=r2c3.assignment;
    document.getElementById("r2c4").value=r2c4.assignment;
    document.getElementById("r2c5").value=r2c5.assignment;
    document.getElementById("r2c6").value=r2c6.assignment;
    document.getElementById("r2c7").value=r2c7.assignment;
    document.getElementById("r2c8").value=r2c8.assignment;
    document.getElementById("r2c9").value=r2c9.assignment;

    document.getElementById("r3c1").value=r3c1.assignment;
    document.getElementById("r3c2").value=r3c2.assignment;
    document.getElementById("r3c3").value=r3c3.assignment;
    document.getElementById("r3c4").value=r3c4.assignment;
    document.getElementById("r3c5").value=r3c5.assignment;
    document.getElementById("r3c6").value=r3c6.assignment;
    document.getElementById("r3c7").value=r3c7.assignment;
    document.getElementById("r3c8").value=r3c8.assignment;
    document.getElementById("r3c9").value=r3c9.assignment;

    document.getElementById("r4c1").value=r4c1.assignment;
    document.getElementById("r4c2").value=r4c2.assignment;
    document.getElementById("r4c3").value=r4c3.assignment;
    document.getElementById("r4c4").value=r4c4.assignment;
    document.getElementById("r4c5").value=r4c5.assignment;
    document.getElementById("r4c6").value=r4c6.assignment;
    document.getElementById("r4c7").value=r4c7.assignment;
    document.getElementById("r4c8").value=r4c8.assignment;
    document.getElementById("r4c9").value=r4c9.assignment;

    document.getElementById("r5c1").value=r5c1.assignment;
    document.getElementById("r5c2").value=r5c2.assignment;
    document.getElementById("r5c3").value=r5c3.assignment;
    document.getElementById("r5c4").value=r5c4.assignment;
    document.getElementById("r5c5").value=r5c5.assignment;
    document.getElementById("r5c6").value=r5c6.assignment;
    document.getElementById("r5c7").value=r5c7.assignment;
    document.getElementById("r5c8").value=r5c8.assignment;
    document.getElementById("r5c9").value=r5c9.assignment;

    document.getElementById("r6c1").value=r6c1.assignment;
    document.getElementById("r6c2").value=r6c2.assignment;
    document.getElementById("r6c3").value=r6c3.assignment;
    document.getElementById("r6c4").value=r6c4.assignment;
    document.getElementById("r6c5").value=r6c5.assignment;
    document.getElementById("r6c6").value=r6c6.assignment;
    document.getElementById("r6c7").value=r6c7.assignment;
    document.getElementById("r6c8").value=r6c8.assignment;
    document.getElementById("r6c9").value=r6c9.assignment;

    document.getElementById("r7c1").value=r7c1.assignment;
    document.getElementById("r7c2").value=r7c2.assignment;
    document.getElementById("r7c3").value=r7c3.assignment;
    document.getElementById("r7c4").value=r7c4.assignment;
    document.getElementById("r7c5").value=r7c5.assignment;
    document.getElementById("r7c6").value=r7c6.assignment;
    document.getElementById("r7c7").value=r7c7.assignment;
    document.getElementById("r7c8").value=r7c8.assignment;
    document.getElementById("r7c9").value=r7c9.assignment;

    document.getElementById("r8c1").value=r8c1.assignment;
    document.getElementById("r8c2").value=r8c2.assignment;
    document.getElementById("r8c3").value=r8c3.assignment;
    document.getElementById("r8c4").value=r8c4.assignment;
    document.getElementById("r8c5").value=r8c5.assignment;
    document.getElementById("r8c6").value=r8c6.assignment;
    document.getElementById("r8c7").value=r8c7.assignment;
    document.getElementById("r8c8").value=r8c8.assignment;
    document.getElementById("r8c9").value=r8c9.assignment;

    document.getElementById("r9c1").value=r9c1.assignment;
    document.getElementById("r9c2").value=r9c2.assignment;
    document.getElementById("r9c3").value=r9c3.assignment;
    document.getElementById("r9c4").value=r9c4.assignment;
    document.getElementById("r9c5").value=r9c5.assignment;
    document.getElementById("r9c6").value=r9c6.assignment;
    document.getElementById("r9c7").value=r9c7.assignment;
    document.getElementById("r9c8").value=r9c8.assignment;
    document.getElementById("r9c9").value=r9c9.assignment;

}
