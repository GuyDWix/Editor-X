var mode = "sort"
var grid = false


$(function () {
  init();
  initSortable();
});

function init() {
  $(".draggable-outline")
    .each(function () {
      // $(this).css({
      //   width: $(this).width() + "px",
      //   height: $(this).height() + "px"
      // });
    })
    .on("mouseover", function () {
      $(this)
        .addClass("move-cursor")

      if ($(this).hasClass('draggable-outline'))
        $(this).addClass("show-outlines")
    })

    .on("mouseout", function () {
      $(this).removeClass("show-outlines")
    })

    .on("mousedown", function () {
      $(this)
        .removeClass("move-cursor")
        .addClass("grab-cursor")
    })

    .on("mouseup", function () {
      $(this)
        .removeClass("grab-cursor")
        .removeClass("opac")
        .addClass("move-cursor")
    });

  $('.toggle').click(toggleMode)
  $('.toggle_grid')
    .click(toggleGrid)
    .attr('disabled', 'true')

}

function toggleMode() {
  if (mode === "sort") {
    $(".sortable").sortable("destroy")
    $('.toggle_grid').removeAttr('disabled')
    $('.toggle').text('free move')
    
    initDraggable()
    mode = "drag"

  } else {
    $(".draggable").draggable("destroy")
    $('.toggle_grid').attr('disabled', 'true')
    $('.toggle').text('smart layout')

    initSortable()
    mode = "sort"
    
  }

}

function toggleGrid() {
  if (mode === "drag") {
    grid = !grid;
    $(".draggable").draggable("destroy")
    initDraggable()

    $('.toggle_grid')
    .text(`grid is ${grid? "on": "off"}`)
    .removeClass("on")
    .addClass(`${grid? "on": ""}`)
  }
}

function initSortable() {
  $('.section_layout').addClass('draggable-outline')
  $('.section_item_img').removeClass('draggable-outline')

  $(".sortable:not(.section_layout)").sortable({
    tolerance: "pointer"
  });

  $(".section_layout").sortable({
    tolerance: "pointer",
    connectWith:".section_layout"
  });
}

function initDraggable() {
  grid_size = grid ? 20 : 1;

  $('.section_layout').removeClass('draggable-outline')
  $('.section_item_img').addClass('draggable-outline')

  $(".draggable").draggable({
    grid: [grid_size, grid_size],
    containment: ".section_canvas"
  });
}