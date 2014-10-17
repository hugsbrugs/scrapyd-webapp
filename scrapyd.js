// Scrapyd URL, i.e. http://localhost:6800/
var scrapyd_url = 'http://localhost:6800/';
var scrapyd_php_url = 'http://localhost/scrapyd-webapp/';

var projects = null;
var current_project_name = null;

$(document).ready(function()
{    
    show_config();
    listprojects();
    SyntaxHighlighter.all();
});

/**
 * Add a version to a project, creating the project if it doesn’t exist.
 *
 * Supported Request Methods: POST
 * CALL : curl http://localhost:6800/addversion.json -F project=myproject -F version=r23 -F egg=@myproject.egg
 * RESPONSE : {"status": "ok", "spiders": 3}
 *
 * @param project (string, required) - the project name
 * @param version (string, required) - the project version
 * @param egg (file, required) - a Python egg containing the project’s code
 */
function addversion(version, egg)
{
    if(current_project_name!==null)
    {
        if(version!==null)
        {
            if(egg!==null)
            {
                $.post(
                    scrapyd_url + 'addversion.json', 
                    { project : current_project_name, version : version, egg: egg }
                ).done(function( data )
                {
                    if(data.status==="ok")
                    {
                        // What do we do whith this : data.jobid ?
                        reset_spiders();
                        listjobs();
                    }
                    else
                    {
                        alert("Error while scheduling job : " + JSON.stringify(data) );
                    }
                });
            }
        }
        else
        {
           alert("No version selected !");
        }
    }
    else
    {
       alert("No project selected !");
    }
}

/**
 * Schedule a spider run (also known as a job), returning the job id.
 *
 * Supported Request Methods: POST
 * CALL : curl http://localhost:6800/schedule.json -d project=myproject -d spider=somespider
 * RESPONSE : {"status": "ok", "jobid": "6487ec79947edab326d6db28a2d86511e8247444"}
 *
 * Example request passing a spider argument (arg1) and a setting (DOWNLOAD_DELAY):
 * curl http://localhost:6800/schedule.json -d project=myproject -d spider=somespider -d setting=DOWNLOAD_DELAY=2 -d arg1=val1
 *
 * @param project (string, required) - the project name
 * @param spider (string, required) - the spider name
 * @param setting (string, optional) - a scrapy setting to use when running the spider
 * @param any other parameter is passed as spider argument
 */
function schedule(spider)
{
    if(current_project_name!==null)
    {
        if(spider!==null)
        {
            $.post(
                scrapyd_url + 'schedule.json', 
                { project : current_project_name, spider : spider }
            ).done(function( data )
            {
                if(data.status==="ok")
                {
                    // What do we do whith this : data.jobid ?
                    reset_spiders();
                    listjobs();
                }
                else
                {
                    alert("Error while scheduling job : " + JSON.stringify(data) );
                }
            });
        }
        else
        {
           alert("No job selected !");
        }
    }
    else
    {
       alert("No project selected !");
    }
}

function scheduleTest(spider, site)
{
    // curl http://localhost:6800/schedule.json -d project=tutorial -d spider=googleSite -d setting=DOWNLOAD_DELAY=1 -d domain_name=sodime.fr
    if(current_project_name!==null)
    {
        if(spider!==null)
        {
            $.post(
                scrapyd_url + 'schedule.json', 
                { project : current_project_name, spider : spider, domain_name : site }
            ).done(function( data )
            {
                if(data.status==="ok")
                {
                    // What do we do whith this : data.jobid ?
                    reset_spiders();
                    listjobs();
                }
                else
                {
                    alert("Error while scheduling job : " + JSON.stringify(data) );
                }
            });
        }
        else
        {
           alert("No job selected !");
        }
    }
    else
    {
       alert("No project selected !");
    }
    
}
/**
 * Cancel a spider run (aka. job). If the job is pending, it will be removed. If the job is running, it will be terminated.
 * 
 * Supported Request Methods: POST
 * CALL : curl http://localhost:6800/cancel.json -d project=myproject -d job=6487ec79947edab326d6db28a2d86511e8247444
 * RESPONSE : {"status": "ok", "prevstate": "running"}
 * 
 * @param project (string, required) - the project name
 * @param job (string, required) - the job id
 */
function cancel(job_id)
{
    if(current_project_name!==null)
    {
        if(job_id!==null)
        {
            if(confirm("Confirm cancel job : "+job_id))
            {
                $.post(
                    scrapyd_url + 'cancel.json',
                    { project : current_project_name, job : job_id}
                ).done(function( data )
                {
                    alert(JSON.stringify(data) );
                    if(data.status==="ok")
                    {
                        // What do we do whith this : data.prevstate ?
                        reset_spiders();
                        listjobs();
                    }
                    else
                    {
                        alert("Error while canceling job : " + JSON.stringify(data) );
                    }
                });
            }
        }
        else
        {
           alert("No job selected !");
        }
    }
    else
    {
       alert("No project selected !");
    }
}

/**
 * Get the list of projects uploaded to this Scrapy server.
 * 
 * Supported Request Methods: GET
 * 
 * CALL : curl http://localhost:6800/listprojects.json
 * RESPONSE : {"status": "ok", "projects": ["myproject", "otherproject"]}
 */
function listprojects()
{
    $.getJSON( scrapyd_url+"listprojects.json", {} ).done(function( json )
        {
            //console.log( "JSON Data: " + JSON.stringify(json) );
            items = [];
            $.each(json.projects, function(key, val)
            {
                //items.push('<li id="' + val + '">' + val + ' <a href="javascript:void(0);" onclick="javascript:show_project(\''+ val + '\');">Show</a> | <a href="javascript:void(0);" onclick="javascript:delproject(\''+ val + '\');">Delete</a></li>');
                //items.push('<li id="' + val + '">' + val + ' <button type="button" class="btn btn-success" onclick="javascript:show_project(\''+ val + '\');"> <i class="fa fa-play-circle"></i> </button> <button type="button" class="btn btn-danger" onclick="javascript:delproject(\''+ val + '\');"> <i class="fa fa-trash"></i> </button></li>');
                var one_project = '';
                one_project += '<div class="col-xs-12 col-sm-6 project-list">';
                    one_project += '<span>' + val + '</span>';
                    one_project += '<button type="button" class="btn btn-success" onclick="javascript:show_project(\''+ val + '\');"> <i class="fa fa-play-circle"></i> </button>';
                    one_project += '<button type="button" class="btn btn-danger" onclick="javascript:delproject(\''+ val + '\');"> <i class="fa fa-trash"></i> </button>';
                one_project += '</div>';
                items.push(one_project);
            });

            $('#projects').append(items.join(''));
        }
        ).fail(function( jqxhr, textStatus, error )
        {
            //var err = textStatus + ", " + error;
            //console.log( "Request Failed: " + err );
            alert("Request Failed: " + err);
        }
    );
}

/**
 * Get the list of versions available for some project. The versions are returned in order, the last one is the currently used version.
 * 
 * Supported Request Methods: GET
 * CALL : curl http://localhost:6800/listversions.json?project=myproject
 * RESPONSE : {"status": "ok", "versions": ["r99", "r156"]}
 * @param project (string, required) - the project name
 */
function listversions()
{
    if(current_project_name!==null)
    {
        $.getJSON(scrapyd_url + 'listversions.json?project=' + current_project_name, function(data)
        {
            if(data.status==="ok")
            {
                if(data.versions.length > 0)
                {
                    $.each(data.versions, function(key, val)
                    {
                        var one_item = '<tr>';
                            one_item += '<td>'+val+'</td>';
                            one_item += '<td><button type="button" class="btn btn-danger" onclick="javascript:delversion('+val+');"> <i class="fa fa-trash"></i> </button></td>';
                        one_item += '</tr>';
                        $('#project_versions').append(one_item);
                    });
                }
                else
                {
                    $('#project_versions').append('<tr><td colspan="2">No version available : strange no ?</td></tr>');   
                }
            }
            else
            {
                alert("Error : "+JSON.stringify(data));
            }
        });
    }
    else
    {
        alert("No project selected !");
    }
}

/**
 * Get the list of spiders available in the last version of some project.
 *
 * Supported Request Methods: GET
 * CALL :curl http://localhost:6800/listspiders.json?project=myproject
 * RESPONSE : {"status": "ok", "spiders": ["spider1", "spider2", "spider3"]}
 * 
 * @param project (string, required) - the project name
 */
function listspiders()
{
    if(current_project_name!==null)
    {
        $.getJSON(scrapyd_url + 'listspiders.json?project=' + current_project_name, function(data)
        {
            if(data.status==="ok")
            {
                //var items = [];
                //console.log(data);
                $.each(data.spiders, function(key, val)
                {
                    //items.push('<li id="' + val + '">' + val + ' <a href="javascript:void(0);" onclick="javascript:schedule(\''+val+'\');">Start</a></li>');
                    //items.push('<li id="' + val + '"><button type="button" class="btn btn-success" onclick="javascript:schedule(\''+val+'\');"><i class="fa fa-play"></i> Start ' + val + ' spider</button></li>');
                    var one_item = '<tr>';
                        one_item += '<td>'+val+'</td>';
                        one_item += '<td><button type="button" class="btn btn-success" onclick="javascript:schedule(\''+val+'\');"> <i class="fa fa-play"></i> </button></td>';
                    one_item += '</tr>';
                    $('#available_spiders').append(one_item);

                });

                //$('#available_spiders').append(items.join(''));
            }
            else
            {
                alert("Error : "+JSON.stringify(data));
            }
        });
    }
    else
    {
        alert("No project selected !");
    }
}

/**
 * Get the list of pending, running and finished jobs of some project.
 *
 * Supported Request Methods: GET
 * CALL : curl http://localhost:6800/listjobs.json?project=myproject
 * RESPONSE : {"status": "ok",
 * "pending": [{"id": "78391cc0fcaf11e1b0090800272a6d06", "spider": "spider1"}],
 * "running": [{"id": "422e608f9f28cef127b3d5ef93fe9399", "spider": "spider2", "start_time": "2012-09-12 10:14:03.594664"}],
 * "finished": [{"id": "2f16646cfcaf11e1b0090800272a6d06", "spider": "spider3", "start_time": "2012-09-12 10:14:03.594664", "end_time": "2012-09-12 10:24:03.594664"}]}
 * @param project (string, required) - the project name
 */
function listjobs()
{
    if(current_project_name!==null)
    {
        $.getJSON(scrapyd_url + 'listjobs.json?project=' + current_project_name, function(data)
        {
            //console.log("List jobs : "+JSON.stringify(data));
            if(data.status==="ok")
            {
                /* PENDING JOBS */
                if (data.pending.length > 0)
                {
                    $.each(data.running, function(key, val)
                    {
                        //pending_spiders.push(val.spider);
                        //pending_items.push('<li>' + val.spider + ' <a href="javascript:void(0);" onclick="javascript:cancel(\''+val.id+'\');">Cancel</a>');
                        var one_item = '';
                        one_item = '<tr>';
                            one_item += '<td>'+val.spider+'</td>';
                            one_item += '<td>'+val.id+'</td>';
                            one_item += '<td><button type="button" class="btn btn-danger" onclick="javascript:cancel(\''+val.id+'\');"> <i class="fa fa-trash"></i> </button></td>';
                        one_item += '</tr>';
                        $('#pending_spiders').append(one_item);
                    });
                }
                else
                {
                    $('#pending_spiders').append('<tr><td colspan="3">No Pending spiders</td></tr>');
                }

                /* RUNNING JOBS */
                if (data.running.length > 0)
                {
                    $.each(data.running, function(key, val)
                    {
                        var start_time = moment(val.start_time);
                        var one_item = '';
                        one_item = '<tr>';
                            one_item += '<td>'+val.spider+'</td>';
                            one_item += '<td>'+start_time.format("DD/MM/YYYY HH:mm:ss")+'</td>';
                            one_item += '<td>'+val.id+'</td>';
                            one_item += '<td><button type="button" class="btn btn-warning" onclick="javascript:show_log(\''+scrapyd_url+'logs/'+current_project_name+'/'+val.spider+'/'+val.id+'.log\');"> <i class="fa fa-fast-forward"></i> </button></td>';
                            one_item += '<td><button type="button" class="btn btn-danger" onclick="javascript:cancel(\''+val.id+'\');"> <i class="fa fa-trash"></i> </button></td>';
                        one_item += '</tr>';
                        $('#running_spiders').append(one_item);

                    });
                }
                else
                {
                    $('#running_spiders').append('<tr><td colspan="5">No Running spiders</td></tr>');
                }

                /* FINISHED JOBS */
                if (data.finished.length > 0)
                {
                    $.each(data.finished, function(key, val)
                    {
                        //finished_spiders.push(val.spider);
                        /* Utilisation de moment.js pour calculer le temps pris par un spider : 
                            http://momentjs.com/docs/#/use-it/
                            http://stackoverflow.com/questions/18623783/get-the-time-difference-between-two-datetimes
                        */                         
                        var end_time = moment(val.end_time);
                        var start_time = moment(val.start_time);
                        //var dif = end_time.diff(start_time, 'seconds', true);
                        //var dif = moment(end_time.diff(start_time)).format('HH:mm:ss');
                        var ms = moment(end_time,"DD/MM/YYYY HH:mm:ss").diff(moment(start_time,"DD/MM/YYYY HH:mm:ss"));
                        var d = moment.duration(ms);
                        var dif = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

                        var one_item = '';
                        one_item = '<tr>';
                            one_item += '<td>'+val.spider+'</td>';
                            one_item += '<td>'+start_time.format("DD/MM/YYYY HH:mm:ss")+'</td>';
                            one_item += '<td>'+dif+'</td>';
                            one_item += '<td>'+val.id+'</td>';
                            one_item += '<td><button type="button" class="btn btn-warning" onclick="javascript:show_log(\''+scrapyd_url+'logs/'+current_project_name+'/'+val.spider+'/'+val.id+'.log\');"> <i class="fa fa-fast-forward"></i> </button></td>';
                            one_item += '<td><button type="button" class="btn btn-success" onclick="javascript:show_items(\''+scrapyd_url+'items/'+current_project_name+'/'+val.spider+'/'+val.id+'.jl\');"> <i class="fa fa-eject"></i> </button></td>';
                            one_item += '<td><button type="button" class="btn btn-danger" onclick="javascript:cancel(\''+val.id+'\');"> <i class="fa fa-times"></i> </button></td>';
                        one_item += '</tr>';
                        $('#finished_spiders').append(one_item);
                    });
                }
                else
                {
                    $('#finished_spiders').append('<tr><td colspan="7">No Finished spiders</td></tr>');
                }
            }
            else
            {
                alert("Error : "+JSON.stringify(data));
            }
        });
    }
    else
    {
        alert("No project selected !");
    }
}

/**
 * Delete a project version. If there are no more versions available for a given project, that project will be deleted too.
 * 
 * Supported Request Methods: POST
 * CALL : curl http://localhost:6800/delversion.json -d project=myproject -d version=r99
 * RESPONSE : {"status": "ok"}
 * @param project (string, required) - the project name
 * @param version (string, required) - the project version
 */
function delversion(version_id)
{
    if(current_project_name!==null)
    {
        if(version_id!==null)
        {
            if(confirm("Confirm delete version : "+version_id))
            {
                $.post(
                    scrapyd_url + 'delversion.json',
                    { project : current_project_name, version : version_id}
                ).done(function( data )
                {
                    if(data.status==="ok")
                    {
                        reset_versions();
                        listversions();
                    }
                    else
                    {
                        alert("Error while deleting version : " + JSON.stringify(data) );
                    }
                });
            }
        }
        else
        {
           alert("No version selected !");
        }
    }
    else
    {
       alert("No project selected !");
    }
}

/**
 * Delete a project and all its uploaded versions.
 *
 * Supported Request Methods: POST
 * CALL : curl http://localhost:6800/delproject.json -d project=myproject
 * RESPONSE : {"status": "ok"}
 *
 * @param project (string, required) - the project name
 */
function delproject(project_name)
{
    if(project_name!==null)
    {
        if(confirm("Confirm delete project : "+project_name))
        {
            $.post(
                scrapyd_url + 'delproject.json',
                { project : project_name}
            ).done(function( data )
            {
                if(data.status==="ok")
                {
                    reset_projects();
                }
                else
                {
                    alert("Error while deleting project : " + JSON.stringify(data) );
                }
            });
        }
    }
    else
    {
       alert("No project selected !");
    }
}

/**
 *
 */
function show_project(project_name)
{
    // Reset previous project ...
    reset_project();
    if(project_name!==null && project_name!=="")
    {
        current_project_name = project_name;
        $('#project').css('display', 'block');
        $('#current_project').html("Project : "+project_name);
        listversions();
        listspiders();
        listjobs();
    }
    else
    {
        alert("Error : no project");
    }
}

/**
 *
 */
function show_config()
{
    $('#config').append('<li>scrapyd url : '+scrapyd_url+'</li>')
}

/**
 *
 */
function reset_projects()
{
    current_project_name = null;
    reset_project();
}

/**
 *
 */
function reset_project()
{
    current_project_name = null;
    reset_versions();
    $('#available_spiders').html('');
    reset_spiders();
}

/**
 *
 */
function reset_spiders()
{
    $('#pending_spiders').html('');
    $('#running_spiders').html('');
    $('#finished_spiders').html('');    
}

/**
 *
 */
function reset_versions()
{
    $('#project_versions').html('');
}

/**
 *
 */
function show_log(log_file)
{
    get_file(log_file);
}

/**
 *
 */
function show_items(item_file)
{
    get_file(item_file);
}

/**
 *
 */
function get_file(file)
{
    $('#spider_file').html(file);
    launchSpinner("centerSpin", null, null);
    $.ajax({
        type: "POST",
        dataType: 'text',
        url: scrapyd_php_url+'scrapyd.php',
        data: {
            'file':file
        },
        crossDomain : true,
    })
    .done(function( data )
    {
        $('#spider_content').css('display', 'block');
        $('#spider_content').html('<pre class="brush: bash">'+data+'</pre>');
        SyntaxHighlighter.highlight();
        stopSpinner("centerSpin", null);
    })
    .fail( function(xhr, textStatus, errorThrown)
    {
        $('#spider_content').css('display', 'block');
        $('#spider_content').html('<pre class="brush: bash">'+xhr.responseText+"<br>"+textStatus+'</pre>');
        SyntaxHighlighter.highlight();
        stopSpinner("centerSpin", null);
    });
}




/* SPINNER */
var spinnerWait = null;

var opts = {
    lines: 13, /* The number of lines to draw */
    length: 20, /* The length of each line */
    width: 10, /* The line thickness */
    radius: 30, /* The radius of the inner circle */
    corners: 1, /* Corner roundness (0..1) */
    rotate: 0, /* The rotation offset */
    direction: 1, /* 1: clockwise, -1: counterclockwise */
    color: '#000', /* #rgb or #rrggbb or array of colors */
    speed: 1, /* Rounds per second */
    trail: 60, /* Afterglow percentage */
    shadow: false, /* Whether to render a shadow */
    hwaccel: false, /* Whether to use hardware acceleration */
    className: 'spinner', /* The CSS class to assign to the spinner */
    zIndex: 2e9, /* The z-index (defaults to 2000000000) */
    top: 'auto', /* Top position relative to parent in px */
    left: 'auto' /* Left position relative to parent in px */
};  

function launchSpinner(TargetID, Div2Hide, Button2Disabled){
    if(Div2Hide!==null)
    {
        $(Div2Hide).css('visibility', 'hidden');
    }
    if(Button2Disabled!==null)
    {
        $(Button2Disabled).attr("disabled", true);
    }
    /* LAUNCH SPINNER ONLY IF IT'S NOT NULL TO AVOID MULTIPLE SPINNER AT SAME TIME */
    if(spinnerWait===null)
    {
        spinnerWait = new Spinner(opts).spin(document.getElementById(TargetID));
    }

}
function stopSpinner(Div2Show, Button2Enable){
    if(spinnerWait!==null)
    {
        spinnerWait.stop();
        spinnerWait = null;
    }
    if(Div2Show!==null)
    {
        $(Div2Show).css('visibility', 'visible');
    }
    if(Button2Enable!==null)
    {
        $(Button2Enable).attr("disabled", false);
    }
}
