var mode = "sort"
var grid = false


$(function () {
  init()
});

function init() {
  initOutlayoutStyling()
  initUIClicks()
  initSortable()
  createSpacers()
  initResizable()
  // updateLayoutsSizes()
}

function initUIClicks() {
  $('.align-bar-button').click(alignBtns)

  $('.toggle').click(toggleMode)
  $('.toggle_grid')
    .click(toggleGrid)
    .attr('disabled', 'true')

  $('.layout-thumb').click(function () {
    $('.align-bar').addClass('collapsed-bottom')
    $('.recommended-layouts').addClass('collapsed-left')
    setTimeout(() => {
      applyLayout($(this).attr('data-layout'))
    }, 300);
  })
}


function updateLayoutsSizes() {

  layoutsNum = $('.section_layout').length
  basisCalc = Math.round(100 / layoutsNum) + "%"

  $('.section_layout').each(function () {
    $(this).css('flex-basis', basisCalc)
  })
}

function initOutlayoutStyling() {
  $(".draggable-outline")
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
}

function alignBtns() {
  let $currentClickedBtn = $(this)
  let alignMode = $currentClickedBtn.attr('data-align')
  let alignFlexMode = ""

  $('.align-bar-button').removeClass('selected')
  $currentClickedBtn.addClass('selected')

  switch (alignMode) {
    case "left":
      alignFlexMode = "flex-start"
      break;
    case "center":
      alignFlexMode = "center"
      break;
    case "right":
      alignFlexMode = "flex-end"
      break;
  }

  $('.section_layout').css({
    alignItems: alignFlexMode,
    textAlign: alignMode
  })

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
  $(".section_canvas").sortable({
    tolerance: "pointer",
    items: '.section_layout'
  });

  $(".section_layout").sortable({
      tolerance: "pointer",
      connectWith: ".section_layout",
      receive: function (event, ui) {
        if ($(ui.sender).children().length <= 0) {
          $(".section_canvas").width($(".section_canvas").width())
          $(ui.sender).remove()
          $('.section_layout').width('100%')

          $('.collapsed').removeClass(function (index, className) {
            return (className.match(/(^|\s)collapsed\S+/g) || []).join(' ');
          });

        } else {
          $('.section_layout').width('initial')
        }
        $(ui.item).css('z-index', 'initial')
      },
      out: function (event, ui) {
        $(ui.sender).width($(ui.sender).width())
      },
      stop: function () {
        $('.resizer').removeClass('hide')
      },
      activate: function (event, ui) {
        $(ui.item).css('z-index', '999999999999')
        $('.resizer').addClass('hide')
      }
    })
    .addClass('draggable-outline')
}

function initDraggable() {
  grid_size = grid ? 20 : 1;

  $('.section_layout').removeClass('draggable-outline')

  $(".draggable").draggable({
    grid: [grid_size, grid_size],
    containment: ".section_canvas"
  });
}

function createRisizes() {
  const elements = $('.resizable')
  const resizeTemplate = `
  <div class="resizes_wrapper">
    <div class='resizers'>
      <div class='resizer top'></div>
      <div class='resizer right'></div>
      <div class='resizer bottom'></div>
      <div class='resizer left'></div>
      <!-->
      <div class='resizer top-left'></div>
      <div class='resizer top-right'></div>
      <div class='resizer bottom-left'></div>
      <div class='resizer bottom-right'></div>
    </div>
  </div>
`
  elements.each(function () {
    let resizeElChild = $(this).children()
    if (resizeElChild.length >= 1 && !resizeElChild.hasClass('spacers_wrapper')) {
      resizeElChild.append(resizeTemplate)
    } else {
      $(this).append(resizeTemplate)
    }
  })
}

function createSpacers() {
  const elements = $('.section_item')

  elements.each(function () {
    const spacerTemplate = `
    <div class="spacers_wrapper">
        <div class='spacer resizable top'>
          <div class="spacer-handle resizer top"></div>
        </div>
        <div class='spacer resizable right'>
          <div class="spacer-handle resizer right"></div>
        </div>
        <div class='spacer resizable bottom'>
          <div class="spacer-handle resizer bottom"></div>
        </div>
        <div class='spacer resizable left'>
          <div class="spacer-handle resizer left"></div>
        </div>
      ${$(this)[0].outerHTML}
    </div>
  `
    const elW = $(this).outerWidth()
    const elH = $(this).outerHeight()
    const $sectionParent = $(this).closest('.section_layout')

    $sectionParent.append(spacerTemplate)
    $(this).detach()

    let spacersAddedWidth = $sectionParent.find('.spacer.top').height()

    // $sectionParent.find('.spacers_wrapper')
    //   .width(elW + spacersAddedWidth * 2)
    //   .height(elH + spacersAddedWidth * 2)
  })
}

function initResizable() {
  createRisizes()

  const resizers = document.querySelectorAll('.resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  for (let i = 0; i < resizers.length; i++) {
    const currentResizer = resizers[i];
    const element = currentResizer.closest('.resizable');

    currentResizer.addEventListener('mousedown', function (e) {
      e.preventDefault()
      e.stopPropagation()

      destroyDraggableOrSortable()

      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)

    })

    function resize(e) {

      if (currentResizer.classList.contains('top')) {
        const height = original_height - (e.pageY - original_mouse_y)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('bottom')) {
        const height = original_height + (e.pageY - original_mouse_y)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentResizer.classList.contains('left')) {
        const width = original_width - (e.pageX - original_mouse_x)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      }
    }

    function stopResize() {
      restartDraggableOrSortable()
      window.removeEventListener('mousemove', resize)
    }
  }

}

function destroyDraggableOrSortable() {
  if (mode == "sort") {
    $(".sortable").sortable("destroy")
  } else {
    $('.draggable').draggable('destroy')
  }
}

function restartDraggableOrSortable() {
  if (mode == "sort") {
    initSortable()
  } else {
    initDraggable()
  }
}

function applyLayout(layoutNum) {
  let num = +layoutNum;
  destroyDraggableOrSortable()

  if (num == 1) {

    const $sectionLayout = $('.section_layout')
    const $sectionImg = $('.section_item_img')
    const $sectionHeading = $sectionLayout.find('.heading').closest('section_item')
    const $sectionText = $sectionLayout.find('.text').closest('section_item')
    const $sectionButton = $sectionLayout.find('.button').closest('section_item')

    $sectionHeading.detach().appendTo($sectionLayout)
    $sectionText.detach().appendTo($sectionLayout)
    $sectionButton.detach().appendTo($sectionLayout)
    $sectionImg.detach().prependTo($sectionLayout)

    let sectionNewW = $sectionLayout.width() + 80
    let sectionNewH = $sectionLayout.height() + 40

    $sectionLayout
      .width(sectionNewW)
      .height(sectionNewH)
      .css("padding", "0 0 40px 0")
      .addClass('justify-between')
      .removeClass('justify-center')

    $sectionImg.css({
      width: 'calc(100% - 20px)',
      backgroundPosition: "bottom",
      marginBottom: "20px"
    })
  }

  $('.align-bar-button[data-align="center"]').click()

  restartDraggableOrSortable()
}