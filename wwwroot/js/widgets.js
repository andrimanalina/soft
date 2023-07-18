var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});

function isLight(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    }
    else {

        // If hex --> Convert it to RGB: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {

        return true;
    }
    else {

        return false;
    }
}

function dateDiff(date1, date2) {
	var diff = {}
	var tmp = date1 - date2;

	tmp = Math.floor(tmp / 1000);
	diff.sec = tmp % 60;

	tmp = Math.floor((tmp - diff.sec) / 60);
	diff.min = tmp % 60;

	tmp = Math.floor((tmp - diff.min) / 60);
	diff.hour = tmp % 24;

	tmp = Math.floor((tmp - diff.hour) / 24);
	diff.day = tmp % 30;

	tmp = Math.floor((tmp - diff.day) / 30);
	diff.month = tmp % 12;


	tmp = Math.floor((tmp - diff.month) / 12);
	diff.year = tmp;

	return diff;
}

function DateLast(date) {
	date = dateDiff(new Date(), new Date(Date.parse(date)));

	var s = "il y a ";

	if (date.year == 0) {
		if (date.month == 0) {
			if (date.day == 0) {
				if (date.hour == 0) {
					if (date.min == 0) return date.sec == 0 ? "à l'instant" : s + date.sec + " s";
					else {
						if (date.min < 6) return s + "environ " + date.min + " mn";
						return s + date.min + " mn";
					}
				}
				return s + date.hour + " h";
			} else {
				if (date.day == 1) return s + date.day + " jour";
				return s + date.day + " jours";
			}

		}
		return s + date.month + " mois";
	} else {
		if (date.year == 1) return s + date.year + " an";
		return s + date.year + " ans";
	}
}

//#region SortableJS
	//Tâche
function sortableOptionCard(k, v) {
    return Sortable.create(v, {
        sort: true,
        connectWith: "[card-id]",
        containment: "[state-id]",
        cursor: "grabbing",
        revert: true,
        group: 'card',
        animation: 200,
        ghostClass: 'ghost',

        onEnd: function (evt, originalEvent) {
            let sameParent = evt.to == evt.from;
            let noAction = sameParent && evt.oldIndex == evt.newIndex;

            if (noAction) return;
            //return;


            //Goto Back
            let formData = new FormData();
            //let id = header.attr("state-id");
            let cardId = $(evt.item).attr("card-id");
            let stateId = $(evt.to).closest("[state-id]").attr("state-id");
            

            formData.append("me.Mail", User.Username);
            formData.append("me.Password", User.Password);
            formData.append("cardId", cardId);
            formData.append("cardPos", evt.newIndex + 1);
            formData.append("stateId", stateId);

            $.ajax({
                type: "POST",
                url: Origin + "Card/UpdatePosition",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    Datas = JSON.parse(result);
                    if (Datas.type == "login") {
                        User = null;
                        window.location = Origin;
                    }
                    if (Datas.type == "error") {
                        Toast.fire({
                            icon: 'error',
                            title: Datas.msg
                        });
                        window.location.reload();
                    }

                    Toast.fire({
                        icon: 'success',
                        title: `Déplacement de la Tâche Réussi`
                    });

                },

                Error: function (x, e) {
                    Toast.fire({
                        icon: 'error',
                        title: e
                    });
                    window.location.reload();
                }
            });

            
            console.log("end");


        }
    });

}
	//List
function sortableOptionState(k, v) {
    return Sortable.create(v, {
        sort: true,
        containment: "[board-id]",
        connectWith: "[state-id]",
        filter:'#state-new',
        cursor: "grabbing",
        revert: true,
        group: 'state',
        animation: 200,
        ghostClass: 'ghost',

        onMove: function (e) {
            return e.related.className.indexOf('static') === -1;
        },
        /*onMove: function (evt, nect) {
            console.log(evt);
            console.log(nect);
        },*/
        onEnd: function (evt) {
            let noAction = evt.oldIndex == evt.newIndex;

            if (noAction) return;

            //Goto Back
            let formData = new FormData();
            //let id = header.attr("state-id");
            let stateId = $(evt.item).attr("state-id");
            let boardId = $(evt.to).closest("[board-id]").attr("board-id");

            formData.append("me.Mail", User.Username);
            formData.append("me.Password", User.Password);
            formData.append("boardId", boardId);
            formData.append("statePos", evt.newIndex + 1);
            formData.append("stateId", stateId);

            $.ajax({
                type: "POST",
                url: "../State/UpdatePosition",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    Datas = JSON.parse(result);
                    if (Datas.type == "login") {
                        User = null;
                        window.location = Origin;
                    }
                    if (Datas.type == "error") {
                        Toast.fire({
                            icon: 'error',
                            title: Datas.msg
                        });
                        window.location.reload();
                    }

                    Toast.fire({
                        icon: 'success',
                        title: `Déplacement de la liste Réussi`
                    });

                },

                Error: function (x, e) {
                    Toast.fire({
                        icon: 'error',
                        title: e
                    });
                    window.location.reload();
                }
            });


            console.log("end");


        }
    });

}
//#endregion