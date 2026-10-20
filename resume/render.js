// resume/data.json 을 읽어 이력서를 그린다. 형식은 docs/resume-design.md 참고.
// 배치는 Jake's Resume(개발자 이력서 LaTeX 템플릿)를 따른다 — 한 단, 가로줄 절 제목, 굵은 제목 + 오른쪽 날짜.
(function () {
  'use strict';

  // children 은 노드 또는 문자열
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function list(tag, cls, items) {
    return el(tag, cls ? { class: cls } : {}, items.map(function (t) { return el('li', { text: t }); }));
  }

  // "2019-08" → "2019.08", null → "현재"
  function ym(v) { return v ? v.replace('-', '.') : '현재'; }

  // "2019-08" → 개월 수 (null 은 오늘)
  function months(v) {
    var d = new Date();
    var m = v ? v.split('-') : [d.getFullYear(), d.getMonth() + 1];
    return Number(m[0]) * 12 + Number(m[1]) - 1;
  }

  // 시작·끝 달을 모두 넣어 센 기간 → "1년 3개월"
  function duration(start, end) {
    var n = months(end) - months(start) + 1;
    if (!start || n < 1) return '';
    var y = Math.floor(n / 12), m = n % 12;
    return (y ? y + '년' : '') + (y && m ? ' ' : '') + (m ? m + '개월' : '');
  }

  function section(title, body, cls) {
    return el('section', { class: 'sec' + (cls ? ' ' + cls : '') }, [el('h2', { text: title }), el('div', { class: 'sec-body' }, body)]);
  }

  // 항목 머리 두 줄: [굵은 제목 | 기울임 부가] ··· [오른쪽 날짜], [기울임 왼쪽] ··· [기울임 오른쪽]
  function entryHead(title, extra, right, sub, subRight) {
    return [
      el('div', { class: 'row' }, [
        el('h3', {}, [title, extra ? el('span', { class: 'extra' }, [el('span', { class: 'bar', text: '|' }), el('em', { text: extra })]) : null]),
        right ? el('span', { class: 'date', text: right }) : null
      ]),
      sub || subRight ? el('div', { class: 'row sub' }, [el('em', { text: sub || '' }), subRight ? el('em', { text: subRight }) : null]) : null
    ];
  }

  function profile(p) {
    var c = p.contact || {};
    var items = [];
    if (p.nameEn) items.push(el('span', { text: p.nameEn }));
    if (c.email) items.push(el('a', { href: 'mailto:' + c.email, text: c.email }));
    if (c.phone) {
      // 가린 번호(010-****-…)는 전화 링크를 만들지 않는다 (D-008)
      items.push(/\*/.test(c.phone) ? el('span', { text: c.phone }) : el('a', { href: 'tel:' + c.phone.replace(/[^+\d]/g, ''), text: c.phone }));
    }
    var line = [];
    items.forEach(function (n, i) { if (i) line.push(el('span', { class: 'sep', text: '|' })); line.push(n); });
    return el('header', { class: 'profile' }, [el('h1', { text: p.name }), el('p', { class: 'contact' }, line)]);
  }

  function project(pr) {
    var bullets = [];
    if (pr.summary) bullets.push(el('li', { text: pr.summary }));
    if (pr.role) bullets.push(el('li', {}, [el('b', { text: '역할: ' }), pr.role]));
    return el('article', { class: 'entry' + (pr.end ? '' : ' current') }, entryHead(
      pr.title,
      pr.type || '',
      ym(pr.start) + ' – ' + ym(pr.end),
      pr.tech && pr.tech.length ? pr.tech.join(', ') : '',
      pr.end ? duration(pr.start, pr.end) : '진행 중'
    ).concat([bullets.length ? el('ul', { class: 'items' }, bullets) : null]));
  }

  // 오래된 프로젝트는 한 줄로 — 끝난 지 OLD_YEARS 년이 넘으면 「이전 프로젝트」 목록에 제목·기술·기간만
  var OLD_YEARS = 12;
  function isOld(pr) { return pr.end && months(null) - months(pr.end) >= OLD_YEARS * 12; }

  function compact(prs) {
    return el('div', { class: 'older' }, [
      el('h3', { class: 'older-title', text: '이전 프로젝트' }),
      el('ul', { class: 'compact' }, prs.map(function (pr) {
        return el('li', { class: 'row' }, [
          el('span', {}, [el('b', { text: pr.title }), pr.tech && pr.tech.length ? el('em', { text: ' · ' + pr.tech.join(', ') }) : null]),
          el('span', { class: 'date', text: ym(pr.start) + ' – ' + ym(pr.end) })
        ]);
      }))
    ]);
  }

  function projects(prs) {
    var recent = prs.filter(function (pr) { return !isOld(pr); });
    var old = prs.filter(isOld);
    return recent.map(project).concat(old.length ? [compact(old)] : []);
  }

  function troubleshooting(c, i) {
    var rows = [['문제', c.problem], ['원인', c.cause], ['해결', c.solution]];
    return el('article', { class: 'entry' }, entryHead((i + 1) + '. ' + c.title).concat([
      el('ul', { class: 'items' }, rows.filter(function (r) { return r[1] && r[1].length; }).map(function (r) {
        return el('li', {}, [el('b', { text: r[0] }), list('ul', 'sub-items', r[1])]);
      }))
    ]));
  }

  function work(w) {
    return el('article', { class: 'entry' }, entryHead(w.title, w.type || '').concat([list('ul', 'items', w.description || [])]));
  }

  function render(d) {
    var app = document.getElementById('app');
    var p = d.profile || {};
    var pf = d.portfolio || {};
    var hasCases = pf.troubleshooting && pf.troubleshooting.length;
    document.title = (p.name || '') + '_이력서'; // PDF 로 저장할 때 기본 파일 이름이 된다
    app.textContent = '';
    [
      profile(p),
      p.intro && p.intro.length ? section('소개', [el('div', { class: 'intro' }, p.intro.map(function (t) { return el('p', { text: t }); }))]) : null,
      d.goals && d.goals.length ? section('목표 및 포부', [list('ul', 'items', d.goals)]) : null,
      d.skills && d.skills.length ? section('보유 기술', [el('ul', { class: 'skills' }, d.skills.map(function (s) {
        return el('li', {}, [el('b', { text: s.name }), s.description ? ': ' + s.description : '']);
      }))], 'page-start') : null,
      d.projects && d.projects.length ? section('프로젝트 이력', projects(d.projects)) : null,
      hasCases ? section('문제 해결 사례', pf.troubleshooting.map(troubleshooting), 'portfolio portfolio-start') : null,
      pf.works && pf.works.length ? section('개인 개발', pf.works.map(work), 'portfolio' + (hasCases ? '' : ' portfolio-start')) : null,
      d.updated ? el('footer', { text: '최종 수정 ' + d.updated }) : null
    ].forEach(function (n) { if (n) app.appendChild(n); });
  }

  // 도구 막대: PDF 다운로드(서버에서 미리 만든 파일 — scripts/build-pdf.mjs), 인쇄, 포트폴리오 포함 여부
  var toggle = document.getElementById('with-portfolio');
  var pdf = document.getElementById('pdf');
  if (toggle) {
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('no-portfolio', !toggle.checked);
      if (pdf) {
        pdf.href = toggle.checked ? 'pdf/resume.pdf' : 'pdf/resume-only.pdf';
        pdf.download = toggle.checked ? '송강민_이력서.pdf' : '송강민_이력서_요약.pdf';
      }
    });
  }
  var printBtn = document.getElementById('print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  fetch('data.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (e) {
      document.getElementById('app').textContent = '이력서 데이터를 불러오지 못했습니다 (' + e.message + ').';
    });
})();
