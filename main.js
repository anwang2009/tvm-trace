
function divMouseClick(class_name) {
    // ref structure is {current/parent}-hash-idx
    // We can traverse the parent hashes until there are no more elements
    // Currently we pass in parent hashes

    var items = [].slice.call(document.getElementsByClassName(class_name));
    console.log("mouse over on class name", class_name)

    console.log("items", items)

    var orig_item = items[0];
    var selected = orig_item.classList.contains("selected");

    // Go up
    while (items.length > 0) {
        let item = items.shift();
        if (selected) {
            item.classList.remove("selected");
        } else {
            item.classList.add("selected");
        }
        let parent_ref = [].slice.call(item.classList).filter(ref => ref.startsWith("parent-"))[0];
        if (typeof parent_ref !== 'undefined') {
            let search_ref = "current-" + parent_ref.split("-")[1];
            console.log("looking for", search_ref);
            console.log(document.getElementsByClassName(search_ref));
            items = [].slice.call(document.getElementsByClassName(search_ref));
            console.log(items);
        }
    }
    // Go down
    if (selected) {
        var curr_ref = [].slice.call(orig_item.classList).filter(ref => ref.startsWith("current-"))[0];
        var child_ref = "parent-" + curr_ref.split("-")[1];
        var items = [].slice.call(document.getElementsByClassName(child_ref));
        while (items.length > 0) {
            var item = items.shift();
            if (item.classList.contains("selected")) {
                item.classList.remove("selected");
                var curr_ref = [].slice.call(item.classList).filter(ref => ref.startsWith("current-"))[0];
                var search_ref = "parent-" + curr_ref.split("-")[1];
                items = [].slice.call(document.getElementsByClassName(search_ref));
            }
        }

    }
}


document.getElementById('import').onclick = function() {
  var files = document.getElementById('selectFiles').files;
  console.log(files);
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();

  fr.onload = function(e) { 
    console.log(e);
    //var result = JSON.parse(e.target.result);
    //var formatted = JSON.stringify(result, null, 2);
    console.log(e.target.result);
    var formatted = e.target.result;
    console.log("formatted", formatted);
    var lines = formatted.split(/\r?\n/);
    console.log("lines", lines);

    var rx = /\/\* curindex:([0-9]*), parentindex:([0-9]*) \*\//;
    var rx2 = /\/\* curindex:([0-9]*) \*\//;

    let pass_level = 0;
    for (let i = 0; i < lines.length; i++) {
        // Parse comments for parent class name and current class name
        var line = lines[i];
        var temp = document.createElement("div");
        className = "results";
        temp.className = className;
        temp.value = lines[i];
        temp.innerHTML = lines[i];
        temp.id = "div" + i;
        console.log(line)
        var has_comment = line.includes("/*");
        if (has_comment) {
            console.log(line);
            let lineage_comments = rx.exec(line) || rx2.exec(line);
            let current = null;
            let parent = null;
            if (lineage_comments !== null) {
                let lineage = lineage_comments[0].split(",");
                let current_comment = lineage[0].split(":")[1].split("*/")[0].trim();
                current = pass_level + "_" + current_comment;
                if (lineage.length > 1) {
                    let parent_comment = lineage[1].split(":")[1].split("*/")[0].trim();
                    parent = (pass_level - 1) + "_" + parent_comment;
                }
                console.log(current, parent);
            }
            // split by comments
            console.log(line.split("/*")[1]);
            
            let current_ref = ("current-" + current);
            console.log(current_ref);
            temp.classList.add(current_ref);
            if (parent !== null) {
                let parent_ref = ("parent-" + parent);
                temp.classList.add(parent_ref);
                console.log("parent_ref", parent_ref);
            }
            if (parent !== null || current !== null) {
                temp.onclick = () => divMouseClick(current_ref);
            }
        } 
        if (line.trim().length == 0) {
            pass_level = pass_level + 1;
            console.log("yo", pass_level);
            temp.innerHTML = "&nbsp";
        }
 

        document.getElementsByTagName("body")[0].appendChild(temp)
    }
	document.getElementById('result').value = formatted;
  }

  fr.readAsText(files.item(0));
};
