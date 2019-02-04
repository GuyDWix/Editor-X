var mode = "sort"
var grid = false


$(function () {
  init();
  // initSortable();
  muuriInit()

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
    connectWith: ".section_layout"
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

function muuriInit() {
  var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));
  var columnGrids = [];
  var boardGrid;

  // Define the column grids so we can drag those
  // items around.
  itemContainers.forEach(function (container) {

    // Instantiate column grid.
    var grid = new Muuri(container, {
        items: '.board-item',
        layoutDuration: 400,
        layoutEasing: 'ease',
        dragEnabled: true,
        dragSort: function () {
          return columnGrids;
        },
        dragSortInterval: 0,
        dragContainer: document.body,
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease'
      })
      .on('dragStart', function (item) {
        // Let's set fixed widht/height to the dragged item
        // so that it does not stretch unwillingly when
        // it's appended to the document body for the
        // duration of the drag.
        item.getElement().style.width = item.getWidth() + 'px';
        item.getElement().style.height = item.getHeight() + 'px';
      })
      .on('dragReleaseEnd', function (item) {
        // Let's remove the fixed width/height from the
        // dragged item now that it is back in a grid
        // column and can freely adjust to it's
        // surroundings.
        item.getElement().style.width = '';
        item.getElement().style.height = '';
        // Just in case, let's refresh the dimensions of all items
        // in case dragging the item caused some other items to
        // be different size.
        columnGrids.forEach(function (grid) {
          grid.refreshItems();
        });
      })
      .on('layoutStart', function () {
        // Let's keep the board grid up to date with the
        // dimensions changes of column grids.
        boardGrid.refreshItems().layout();
      })

      .on('dragEnd', function (item, event) {
        $('.section_layout').each(function(){
          if($(this).children().length <=0)
          $(this).closest('.board-column').remove()
        })
      });

    // Add the column grid reference to the column grids
    // array, so we can access it later on.
    columnGrids.push(grid);

  });

  // Instantiate the board grid so we can drag those
  // columns around.
  boardGrid = new Muuri('.board', {
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: true,
    dragSortInterval: 0,
    dragStartPredicate: {
      handle: '.board-column-header'
    },
    dragStartPredicate: function (item, e) {
      if ($(e.target).hasClass("board-item-content")) {
        return false;
      } else {
        return true
      }
    },
    dragReleaseDuration: 400,
    dragReleaseEasing: 'ease'
  });
}