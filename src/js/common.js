get = (id) => {
    return ducument.getElementById(id);
}

hide = (id) => {
    get(id).style.visibility = 'hidden';
}

show = (id) => {
    get(id).style.visibility = null;
}

html = (id, html) => {
    get(id).innerHTML = html;
}

timestamp = () => {
    return new Date().getTime();
}

random = (min, max) => {
    return (min + (Math.random() * (max - min)));
}

randomChoice = () => {
    return choices[Math.round(random(0, choices.length-1))];
}