var typed = new Typed(".typing",{
    strings: ["Facile à utiliser", "Gestion Rapide", "Suivi en temps réel"],
    typeSpeed: 100,
    backSpeed: 70,
    loop:true
});

$(document).ready(() => {
	User = JSON.parse(sessionStorage.getItem("userTrello"));
	if (User != null && User !== "undefined") window.location = window.origin + "/Workspace";
	//if (User.Username == "") window.location = window.origin;
});

$("#login_username, #login_password").on("keydown", (e) => {

	if (e.keyCode == 13) $("#login_submit").click(); //login();
});

function login() {
	let formData = new FormData();
	let username = $(`#login_username`).val();
	let password = $(`#login_password`).val();
	formData.append("me.Mail", username);
	formData.append("me.Password", password);

	$.ajax({
		type: "POST",
		url: window.location.href + "/Authentication/Login",
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
		async: true,

		success: function (result) {
			Datas = JSON.parse(result);
			if (Datas.type == "login") {
				Toast.fire({
					icon: 'error',
					title: Datas.message
				});
				return;
			}

			if (Datas.type == "error") {
				Toast.fire({
					icon: 'error',
					title: Datas.message
				});
				return;
			}
			
			let user = {
				Username: username,
				Password: password,
				Origin: window.location.href
			}
			sessionStorage.setItem("userTrello", JSON.stringify(user));
			window.location = window.origin + "/Workspace";
		},

		Error: function (x, e) {
			alert("Some error");
			//loading(false);
		}
	});
}

