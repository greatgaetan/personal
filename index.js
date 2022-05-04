$(document).ready(function () {
    //Start with black color when you load the page.
    changeBeforeAfter('#000');
    var mode = (localStorage.getItem('mode') !== undefined) ? localStorage.getItem('mode') : "null";

    if (mode == "dark") {
        darkMode();
    } else if (mode == "light") {
        lightMode;
    }

    $('#mode').click(function () {
        if ($('#mode').attr('class') == "switch-button light") {
            darkMode();
        } else if ($('#mode').attr('class') == "switch-button dark") {
            lightMode();
        }
    })
    function darkMode() {
        localStorage.setItem("mode", "dark");
        $('#mode').attr('class', "switch-button dark");
        $("body").css('color', 'white');
        $("body").css('background', '#1e1e1e');
        $(".card-bg").css('background', "rgb(32, 35, 36)");
        $('.svgfill').css('fill', '#1e1e1e');
        $('.modal__container').css('background-color', '#1e1e1e');
        $('.modal__close').css('color', 'white');
        $('.modal__footer').css('color', 'white');
        $('.screen').css('background', '#3e3e3e');
        $('.app-form-control').css('color', '#ddd');
        $('.cta svg').css("stroke", "white");
        changeBeforeAfter('#fff');
        document.getElementById("dark-mode-text").innerHTML = "Click here for light mode!<i class=\"fas fa-chevron-right\">";
    }

    function lightMode() {
        localStorage.setItem("mode", "light");
        $('#mode').attr('class', "switch-button light");
        $("body").css('color', 'black');
        $("body").css('background', '#f9f9f9');
        $(".card-bg").css('background', "#f1f1f1");
        $('.svgfill').css('fill', '#f9f9f9');
        $('.modal__container').css('background-color', '#f9f9f9');
        $('.modal__close').css('color', 'black');
        $('.modal__footer').css('color', 'black');
        $('.screen').css('background', '#efefef');
        $('.app-form-control').css('color', '#000');
        $('.cta svg').css("stroke", "#000");
        changeBeforeAfter('#000');
        document.getElementById("dark-mode-text").innerHTML = "Click here for dark mode!<i class=\"fas fa-chevron-right\">";
    }
});

/**
 * Make the "click on me" text disappear next to the dark button.
 */
window.onscroll = function () {
    if (window.scrollY > 1) {
        $(".dark-mode-text").css('opacity', '0');
    } else {
        $(".dark-mode-text").css('opacity', '1');
    }
}

/**
 * Init the modal library.
 */
MicroModal.init({
    awaitCloseAnimation: true
});

/**
 * Init the AOS (Animate on scroll) library.
 */
AOS.init({
    duration: 800,// values from 0 to 3000, with step 50ms
    once: true,
});

function changeBeforeAfter(color) {
    var styleElem = document.head.appendChild(document.createElement("style"));
    styleElem.innerHTML = ".click-details-button:hover:before {background: " + color + ";}";
    styleElem.innerHTML = ".click-details-button:after {background: " + color + ";}";
    styleElem.innerHTML = ".click-details-button:before, .click-details-button:after {background: " + color + ";}";
}

$(window).on("load", function () {
    $(".lds-wrapper").fadeOut("slow");
});

var slideIndex = 1;
var borneMin, borneMax;

function slideAt(num) {
    slideIndex = num;
    borneMin = num;
    borneMax = num + 2;
    showSlides(slideIndex);
}

function plusSlides(n) {
    if ((slideIndex + n) < borneMin) {
        showSlides(slideIndex = borneMax);
    } else if (((slideIndex + n)) > borneMax) {
        showSlides(slideIndex = borneMin);
    } else {
        showSlides(slideIndex += n);
    }
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

function openModal(text, num) {
    MicroModal.show(text);
    slideAt(num);
}