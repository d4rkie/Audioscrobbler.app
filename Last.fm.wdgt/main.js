function localize(s)
{
    // lol yeah, we'll do it properly when we can (ie. not just english style)
    rgx = /(\d+)(\d{3})/;
    while (rgx.test(s))
        s = s.replace(rgx, '$1'+','+'$2');
    return s;
}

function $(name)
{
    return document.getElementById(name);
}

var artist;
var artist_url;
var listeners;
var bio;

function artist_got_info(json)
{
    artist = json.artist.name;
    artist_url = json.artist.url;
    listeners = json.artist.stats.listeners;
    bio = json.artist.bio.content;

    // Last.fm returns HTML, but no paragraph formatting :P
    bio = bio.replace(/(\n|\r)+/g, "<p>");
    // Don't open the URL inside the widget!
    bio = bio.replace(/(href=\")+(https?\:\/\/[^\s<>\"$]+)/ig, 'href="javascript:window.widget.openURL(\'$2\');return false;');

    img = new Image();
    img.onload = function() {
        $('image').style.height = parseInt(this.height, 10)+"px";
        $('image').style.backgroundImage='url('+this.src+')';
        $('artist').href = "javascript:window.widget.openURL('"+artist_url+"');return false;";
        $('artist').innerHTML = artist;
        $('listeners').innerText = localize(listeners)+' listeners';
        $('bio').innerHTML = bio;
        window.resizeTo(286, this.height+34);
    };
    img.src = json.artist.image[3]['#text'];
}

function set_artist(scpt)
{
    artist = scpt.outputString.replace(/\s+$/g, "");
    if (artist == '') {
        $('image').style.backgroundImage='';
        $('artist').innerText = '';
        $('listeners').innerText = '';
        $('text').style.display = 'none';
    }
    else if ($('artist').innerText != artist) {
        var url = "http://ws.audioscrobbler.com/2.0/?callback=artist_got_info&method=artist.getinfo&api_key=b25b959554ed76058ac220b7b2e0a026&artist="+encodeURIComponent(artist)+"&format=json";
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        document.body.appendChild(script);
        $('artist').innerHTML = "Loading "+artist+"…";
        $('listeners').innerHTML = "&nbsp;";
        $('text').style.display = 'block';
    }
}

function show()
{
    window.widget.system('/usr/bin/osascript np.scpt', set_artist);
}

if (window.widget) {
    widget.onshow = show;
}
