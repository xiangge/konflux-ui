import * as React from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  MenuToggle,
  Popper,
  EmptyState,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateBody,
  Bullseye,
  ToolbarToggleGroup,
  EmptyStateIcon,
  EmptyStateActions,
  PageSection,
  // Title,
  Button,
  Badge,
  ToolbarGroup,
  ToolbarFilter,
  SearchInput,
  PageSectionVariants,
  Icon,
  Spinner,
  Switch,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { SearchIcon } from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Table, Thead, Tr, Th, Tbody, Td, TableVariant } from '@patternfly/react-table';
import { format, parseISO } from 'date-fns';
// import { useApplications } from '../../hooks/useApplications';
import { useNamespaceInfo } from '../../shared/providers/Namespace';
import PageLayout from '../PageLayout/PageLayout';
// import * as _ from 'lodash-es';
// import axios from 'axios';
// import { useReleases } from '../hooks/useReleases';
// import { useReleasePlans } from '../hooks/useReleasePlans';
// import { K8sListResourceItems } from '../../k8s';
// import { WorkspaceModel } from '../../models/workspace';
// import { Workspace } from '../../types/workspace';
// import { useApplicationReleases } from '../../hooks/useApplicationReleases';
// import { ReleaseGroupVersionKind } from '../models/release';
// import { ReleaseKind } from '../types/release';
// import { ReleasePlanModel } from '../models/release-plan';
// import { releasePlanKind } from '../types/re';
// import { useWorkspaceInfo } from '../utils/workspace-context-utils';

interface Release {
  releasePlan: string;
  application: string;
  rpa: string;
  tenant: string;
  name: string;
  pv: string;
  // start_time: string;
  completionTime: string;
  product: string;
  status: string;
  component: string;
}

const columnNames = {
  application: 'Application', // The application name
  component: 'Component', // The component, a number via link
  releasePlan: 'ReleasePlan', // The ReleasePlan via the application
  rpa: 'ReleasePlanAdmission', // ReleasePlanAdmission point in the Release
  tenant: 'Tenant', // Tenant name
  pv: 'Product Version', // the product_version defined in the RPA spec.data.releaseNotes.product_version
  // startTime: "Start Time", // Release start time
  completionTime: 'Completion Time', // Release end time
  name: 'Release Name', // The release trigger from the ReleasePlan
  product: 'Product', // The product name
  status: 'Status', // The status of the release
};

interface FormattedDateProps {
  isoDateString: string;
}

const FormattedDate = ({ isoDateString }: FormattedDateProps) => {
  // Parse the ISO date string to a Date object
  const date = parseISO(isoDateString);

  // Format the Date object using the specified pattern
  const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');

  return <div>{formattedDate}</div>;
};

const ReleaseMonitor: React.FunctionComponent = () => {
  // Set up release filtering
  const [searchValue, setSearchValue] = React.useState(''); // For RPA
  const [applicationSelections, setApplicationSelections] = React.useState<string[]>([]);
  const [tenantSelections, setTenantSelections] = React.useState<string[]>([]);
  const [pvSelections, setPvSelections] = React.useState<string[]>([]);
  const [statusSelection, setStatusSelection] = React.useState('');
  const [productSelections, setProductSelections] = React.useState<string[]>([]);
  const [releases, setData] = React.useState<Release[]>([]);
  const [loading, setLoading] = React.useState(true);
  // const [releasePlansData, setReleasePlansData] = React.useState({});
  // const [releasesData, setReleasesData] = React.useState({});
  const { namespaces, namespacesLoaded: loaded } = useNamespaceInfo();

  // const results: Release[] = [];

  // if (loaded) {
  //   namespaces.forEach((namespace) => {
  //     // console.log(namespace.metadata.name);
  //     const [applications, appLoaded] = useApplications(namespace.metadata.name);
  //     // const [releases, loaded] = useApplicationReleases(applicationName);
  //     if (appLoaded) {
  //       applications.forEach((application) => {
  //         results.push({
  //           releasePlan: namespace.metadata.name,
  //           application: application.metadata.name,
  //           rpa: 'Test',
  //           tenant: namespace.metadata.name,
  //           name: '123',
  //           pv: '123',
  //           completionTime: '20250526',
  //           product: 'Test',
  //           status: 'Failed',
  //           component: '123',
  //         });
  //       });
  //     }
  //   });
  //   // console.log("Releases ------", releases);
  // }

  // React.useEffect(() => {
  //   setData(results);
  //   setLoading(false);
  // }, [results]);

  // if (!loaded) return;
  // const allResults = React.useMemo(async () => {
  //   // const fetchReleases = async () => {

  //   // fetchReleases();
  //   const result = [];
  //   const namspacePromises = namespaces.map(async (namespace) => {
  //       const [applications, appLoaded] = useApplications(namespace.metadata.name);; // convert your hook to function
  //       if (appLoaded) {
  //         applications.forEach((application) => {
  //           result.push({
  //             releasePlan: namespace.metadata.name,
  //             application: application.metadata.name,
  //             rpa: 'Test',
  //             tenant: namespace.metadata.name,
  //             name: '123',
  //             pv: '123',
  //             completionTime: '20250526',
  //             product: 'Test',
  //             status: 'Failed',
  //             component: '123',
  //           });
  //         });
  //       }
  //     });
  //   await Promise.all(namspacePromises);

  //   return result;
  // }, [namespaces]);

  // React.useEffect(() => {
  //   setData(allResults);
  //   setLoading(false);
  // }, [loaded, allResults]);
  type Application = {
    metadata: {
      name: string;
    };
  };
  const fetchApplications = React.useCallback(
    async (name: string): Promise<[Application[], boolean]> => {
      const res = await fetch(`/api/data/${name}`);
      const data = await res.json();
      return [[{ metadata: { name: data } }], true];
    },
    [],
  );

  React.useEffect(() => {
    const fetchAll = async () => {
      const results: Release[] = [];

      const namspacePromises = namespaces.map(async (namespace) => {
        // const foos = await fetchFoos(test.name); // replace this with actual data-fetch logic
        const [applications, appLoaded] = await fetchApplications(namespace.metadata.name);
        if (appLoaded) {
          applications.forEach((application) => {
            results.push({
              releasePlan: namespace.metadata.name,
              application: application.metadata.name,
              rpa: 'Test',
              tenant: namespace.metadata.name,
              name: '123',
              pv: '123',
              completionTime: '20250526',
              product: 'Test',
              status: 'Failed',
              component: '123',
            });
          });
        }
      });

      await Promise.all(namspacePromises);
      setData(results);
      setLoading(false);
    };

    fetchAll()
      .then((result) => {
        // handle success
        result;
      })
      .catch((error) => {
        // handle error
        error;
      });
  }, [loaded, namespaces, fetchApplications]);

  // const { array_1, loaded: loaded } = useArray1();
  // if (loaded) {
  //   array_1.forEach((a) => {
  //     const [array_2, load] = useTest(a.name);
  //     if (load) {
  //       array_2.forEach((b) => {
  //         results.push({
  //           foo: b.name,
  //           bar: b.name,
  //           json: 'Test',
  //           john: b.name,
  //         });
  //       });
  //     }
  //   });
  // }

  // React.useEffect(() => {
  //   const getData = async () => {
  //     let allWorkspaces: Workspace[] = [];
  //     // let allReleases: ReleaseKind[] = [];
  //     try {
  //       setLoading(true);
  //       allWorkspaces = await K8sListResourceItems<Workspace>({
  //         model: WorkspaceModel,
  //       });

  //       console.log("Workspaces ------", allWorkspaces);
  //       // const result = await axios.get<any[]>('http://127.0.0.1:8080/api/v1/releases');
  //       // console.log('API Response:', result);
  //       // console.log('Response Data:', result.data);
  //       // setData(result.data);
  //       // const promises = ["chcao-tenant"].map(namespace => useReleasePlans(namespace)); // Create an array of promises
  //       // const results = await Promise.all(promises); // Wait for all promises to resolve

  //       // // Store results in an object
  //       // const plansData = ["chcao-tenant"].reduce((acc, namespace, index) => {
  //       //   acc[namespace] = results[index];
  //       //   return acc;
  //       // }, {});

  //       // setReleasePlansData(plansData);
  //       // const fetchData = async () => {
  //       //   const rpResults = {};
  //       //   const rResults = {};

  //       //   // Loop through each namespace and call the hook
  //       //   for (const namespace of ["chcao-tenant"]) {
  //       //     const [plans, , ] = useReleasePlans(namespace);
  //       //     rpResults[namespace] = plans; // Store the results in an object
  //       //     const [res, , ] = useReleases(namespace);
  //       //     rResults[namespace] = res; // Store the results in an object
  //       //   }

  //       //   // After all hooks are called, update the state
  //       //   setReleasePlansData(rpResults);
  //       //   setReleasesData(rResults);
  //       // };

  //       // fetchData();
  //     } catch (e) {
  //       console.error('Error fetching CRs', e);
  //     }finally {
  //       setLoading(false);
  //     }
  //   }
  //   getData();
  // }, []);

  // const [thereleases, , ] = useK8sWatchResource({
  //   groupVersionKind: {
  //     group: 'appstudio.redhat.com',
  //     version: 'v1alpha1',
  //     kind: 'Release',
  //   },
  //   namespace: 'centos-bootc-tenant',
  //   isList: true,
  // });

  // const { namespace } = useWorkspaceInfo();
  // const [r, ,] = useK8sWatchResource<ReleaseKind[]>({
  //   groupVersionKind: ReleaseGroupVersionKind,
  //   namespace,
  //   isList: true,
  // });

  // console.log("Bootc releases ------", thereleases);
  // console.log("Bootc releases ------", r);

  const applications = Array.from(new Set(releases.map((release) => release.application)));
  const tenants = Array.from(new Set(releases.map((release) => release.tenant)));
  const pvs = Array.from(new Set(releases.map((release) => release.pv)));
  const products = Array.from(new Set(releases.map((release) => release.product)));

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const onFilter = (release: Release) => {
    // Search with search value
    let searchValueInput: RegExp;
    try {
      searchValueInput = new RegExp(searchValue, 'i');
    } catch (err) {
      searchValueInput = new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    // Search with selections
    const matchesSearchValue = release.releasePlan.search(searchValueInput) >= 0;
    const matchesTenantValue = tenantSelections.includes(release.tenant);
    const matchesPvValue = pvSelections.includes(release.pv);
    const matchesApplicationValue = applicationSelections.includes(release.application);
    const matchesStatusValue = release.status.toLowerCase() === statusSelection.toLowerCase();
    const matchesProductValue = productSelections.includes(release.product);

    return (
      (searchValue === '' || matchesSearchValue) &&
      (tenantSelections.length === 0 || matchesTenantValue) &&
      (pvSelections.length === 0 || matchesPvValue) &&
      (applicationSelections.length === 0 || matchesApplicationValue) &&
      (statusSelection === '' || matchesStatusValue) &&
      (productSelections.length === 0 || matchesProductValue)
    );
  };

  const filteredReleases = releases.filter(onFilter);

  // Set up name search input
  const searchInput = (
    <SearchInput
      placeholder="Filter by product name"
      value={searchValue}
      onChange={(_event, value) => onSearchChange(value)}
      onClear={() => onSearchChange('')}
    />
  );

  // Set up PV checkbox select
  const [isPvMenuOpen, setIsPvMenuOpen] = React.useState<boolean>(false);
  const pvToggleRef = React.useRef<HTMLButtonElement>(null);
  const pvMenuRef = React.useRef<HTMLDivElement>(null);
  const pvContainerRef = React.useRef<HTMLDivElement>(null);

  const handPvMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (isPvMenuOpen && pvMenuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsPvMenuOpen(!isPvMenuOpen);
          pvToggleRef.current?.focus();
        }
      }
    },
    [isPvMenuOpen, pvMenuRef],
  );

  const handlePvClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isPvMenuOpen && !pvMenuRef.current?.contains(event.target as Node)) {
        setIsPvMenuOpen(false);
      }
    },
    [isPvMenuOpen, pvMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handPvMenuKeys);
    window.addEventListener('click', handlePvClickOutside);
    return () => {
      window.removeEventListener('keydown', handPvMenuKeys);
      window.removeEventListener('click', handlePvClickOutside);
    };
  }, [handPvMenuKeys, handlePvClickOutside]);

  const onPvMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (pvMenuRef.current) {
        const firstElement = pvMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsPvMenuOpen(!isPvMenuOpen);
  };

  function onPvMenuSelect(
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const itemStr = itemId.toString();

    setPvSelections(
      pvSelections.includes(itemStr)
        ? pvSelections.filter((selection) => selection !== itemStr)
        : [itemStr, ...pvSelections],
    );
  }

  const pvToggle = (
    <MenuToggle
      ref={pvToggleRef}
      onClick={onPvMenuToggleClick}
      isExpanded={isPvMenuOpen}
      {...(pvSelections.length > 0 && { badge: <Badge isRead>{pvSelections.length}</Badge> })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by pv
    </MenuToggle>
  );

  const pvMenu = (
    <Menu
      ref={pvMenuRef}
      id="attribute-search-location-menu"
      onSelect={onPvMenuSelect}
      selected={pvSelections}
    >
      <MenuContent>
        <MenuList>
          {pvs.map((pv) => (
            <MenuItem key={pv} hasCheckbox isSelected={pvSelections.includes(pv)} itemId={pv}>
              {pv}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const pvSelect = (
    <div ref={pvContainerRef}>
      <Popper
        trigger={pvToggle}
        triggerRef={pvToggleRef}
        popper={pvMenu}
        popperRef={pvMenuRef}
        appendTo={pvContainerRef.current || undefined}
        isVisible={isPvMenuOpen}
      />
    </div>
  );
  // Set up PV checkbox select end

  // Set up Application checkbox select
  const [isApplicationMenuOpen, setIsApplicationMenuOpen] = React.useState<boolean>(false);
  const applicationToggleRef = React.useRef<HTMLButtonElement>(null);
  const applicationMenuRef = React.useRef<HTMLDivElement>(null);
  const applicationContainerRef = React.useRef<HTMLDivElement>(null);

  const handApplicationMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (isApplicationMenuOpen && applicationMenuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsApplicationMenuOpen(!isApplicationMenuOpen);
          applicationToggleRef.current?.focus();
        }
      }
    },
    [isApplicationMenuOpen, applicationMenuRef],
  );

  const handleApplicationClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isApplicationMenuOpen && !applicationMenuRef.current?.contains(event.target as Node)) {
        setIsApplicationMenuOpen(false);
      }
    },
    [isApplicationMenuOpen, applicationMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handApplicationMenuKeys);
    window.addEventListener('click', handleApplicationClickOutside);
    return () => {
      window.removeEventListener('keydown', handApplicationMenuKeys);
      window.removeEventListener('click', handleApplicationClickOutside);
    };
  }, [handApplicationMenuKeys, handleApplicationClickOutside]);

  const onApplicationMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (applicationMenuRef.current) {
        const firstElement = applicationMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsApplicationMenuOpen(!isApplicationMenuOpen);
  };

  function onApplicationMenuSelect(
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const itemStr = itemId.toString();

    setApplicationSelections(
      applicationSelections.includes(itemStr)
        ? applicationSelections.filter((selection) => selection !== itemStr)
        : [itemStr, ...applicationSelections],
    );
  }

  const applicationToggle = (
    <MenuToggle
      ref={applicationToggleRef}
      onClick={onApplicationMenuToggleClick}
      isExpanded={isApplicationMenuOpen}
      {...(applicationSelections.length > 0 && {
        badge: <Badge isRead>{applicationSelections.length}</Badge>,
      })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by application
    </MenuToggle>
  );

  const applicationMenu = (
    <Menu
      ref={applicationMenuRef}
      id="attribute-search-location-menu"
      onSelect={onApplicationMenuSelect}
      selected={applicationSelections}
    >
      <MenuContent>
        <MenuList>
          {applications.map((application) => (
            <MenuItem
              key={application}
              hasCheckbox
              isSelected={applicationSelections.includes(application)}
              itemId={application}
            >
              {application}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const applicationSelect = (
    <div ref={applicationContainerRef}>
      <Popper
        trigger={applicationToggle}
        triggerRef={applicationToggleRef}
        popper={applicationMenu}
        popperRef={applicationMenuRef}
        appendTo={applicationContainerRef.current || undefined}
        isVisible={isApplicationMenuOpen}
      />
    </div>
  );
  // Set up Application checkbox select end

  // Set up Tenant checkbox select
  const [isTenantMenuOpen, setIsTenantMenuOpen] = React.useState<boolean>(false);
  const tenantToggleRef = React.useRef<HTMLButtonElement>(null);
  const tenantMenuRef = React.useRef<HTMLDivElement>(null);
  const tenantContainerRef = React.useRef<HTMLDivElement>(null);

  const handTenantMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (isTenantMenuOpen && tenantMenuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsTenantMenuOpen(!isTenantMenuOpen);
          tenantToggleRef.current?.focus();
        }
      }
    },
    [isTenantMenuOpen, tenantMenuRef],
  );

  const handleTenantClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isTenantMenuOpen && !tenantMenuRef.current?.contains(event.target as Node)) {
        setIsTenantMenuOpen(false);
      }
    },
    [isTenantMenuOpen, tenantMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handTenantMenuKeys);
    window.addEventListener('click', handleTenantClickOutside);
    return () => {
      window.removeEventListener('keydown', handTenantMenuKeys);
      window.removeEventListener('click', handleTenantClickOutside);
    };
  }, [handTenantMenuKeys, handleTenantClickOutside]);

  const onTenantMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (tenantMenuRef.current) {
        const firstElement = tenantMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsTenantMenuOpen(!isTenantMenuOpen);
  };

  function onTenantMenuSelect(
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const itemStr = itemId.toString();

    setTenantSelections(
      tenantSelections.includes(itemStr)
        ? tenantSelections.filter((selection) => selection !== itemStr)
        : [itemStr, ...tenantSelections],
    );
  }

  const tenantToggle = (
    <MenuToggle
      ref={tenantToggleRef}
      onClick={onTenantMenuToggleClick}
      isExpanded={isTenantMenuOpen}
      {...(tenantSelections.length > 0 && {
        badge: <Badge isRead>{tenantSelections.length}</Badge>,
      })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by tenant
    </MenuToggle>
  );

  const tenantMenu = (
    <Menu
      ref={tenantMenuRef}
      id="attribute-search-location-menu"
      onSelect={onTenantMenuSelect}
      selected={tenantSelections}
    >
      <MenuContent>
        <MenuList>
          {tenants.map((tenant) => (
            <MenuItem
              key={tenant}
              hasCheckbox
              isSelected={tenantSelections.includes(tenant)}
              itemId={tenant}
            >
              {tenant}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const tenantSelect = (
    <div ref={tenantContainerRef}>
      <Popper
        trigger={tenantToggle}
        triggerRef={tenantToggleRef}
        popper={tenantMenu}
        popperRef={tenantMenuRef}
        appendTo={tenantContainerRef.current || undefined}
        isVisible={isTenantMenuOpen}
      />
    </div>
  );
  // Set up Tenant checkbox select end

  // Set up Product checkbox select
  const [isProductMenuOpen, setIsProductMenuOpen] = React.useState<boolean>(false);
  const productToggleRef = React.useRef<HTMLButtonElement>(null);
  const productMenuRef = React.useRef<HTMLDivElement>(null);
  const productContainerRef = React.useRef<HTMLDivElement>(null);

  const handProductMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (isProductMenuOpen && productMenuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsProductMenuOpen(!isProductMenuOpen);
          productToggleRef.current?.focus();
        }
      }
    },
    [isProductMenuOpen, productMenuRef],
  );

  const handleProductClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isProductMenuOpen && !productMenuRef.current?.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
    },
    [isProductMenuOpen, productMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handProductMenuKeys);
    window.addEventListener('click', handleProductClickOutside);
    return () => {
      window.removeEventListener('keydown', handProductMenuKeys);
      window.removeEventListener('click', handleProductClickOutside);
    };
  }, [handProductMenuKeys, handleProductClickOutside]);

  const onProductMenuToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (productMenuRef.current) {
        const firstElement = productMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsProductMenuOpen(!isProductMenuOpen);
  };

  function onProductMenuSelect(
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) {
    if (typeof itemId === 'undefined') {
      return;
    }

    const itemStr = itemId.toString();

    setProductSelections(
      productSelections.includes(itemStr)
        ? productSelections.filter((selection) => selection !== itemStr)
        : [itemStr, ...productSelections],
    );
  }

  const productToggle = (
    <MenuToggle
      ref={productToggleRef}
      onClick={onProductMenuToggleClick}
      isExpanded={isProductMenuOpen}
      {...(productSelections.length > 0 && {
        badge: <Badge isRead>{productSelections.length}</Badge>,
      })}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by product
    </MenuToggle>
  );

  const productMenu = (
    <Menu
      ref={productMenuRef}
      id="attribute-search-location-menu"
      onSelect={onProductMenuSelect}
      selected={productSelections}
    >
      <MenuContent>
        <MenuList>
          {products.map((product) => (
            <MenuItem
              key={product}
              hasCheckbox
              isSelected={productSelections.includes(product)}
              itemId={product}
            >
              {product}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const productSelect = (
    <div ref={productContainerRef}>
      <Popper
        trigger={productToggle}
        triggerRef={productToggleRef}
        popper={productMenu}
        popperRef={productMenuRef}
        appendTo={productContainerRef.current || undefined}
        isVisible={isProductMenuOpen}
      />
    </div>
  );
  // Set up Product checkbox select end

  // Set up status single select
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState<boolean>(false);
  const statusToggleRef = React.useRef<HTMLButtonElement>(null);
  const statusMenuRef = React.useRef<HTMLDivElement>(null);
  const statusContainerRef = React.useRef<HTMLDivElement>(null);

  const handleStatusMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (isStatusMenuOpen && statusMenuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsStatusMenuOpen(!isStatusMenuOpen);
          statusToggleRef.current?.focus();
        }
      }
    },
    [isStatusMenuOpen, statusMenuRef],
  );

  const handleStatusClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isStatusMenuOpen && !statusMenuRef.current?.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    },
    [isStatusMenuOpen, statusMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleStatusMenuKeys);
    window.addEventListener('click', handleStatusClickOutside);
    return () => {
      window.removeEventListener('keydown', handleStatusMenuKeys);
      window.removeEventListener('click', handleStatusClickOutside);
    };
  }, [handleStatusMenuKeys, handleStatusClickOutside]);

  const onStatusToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (statusMenuRef.current) {
        const firstElement = statusMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsStatusMenuOpen(!isStatusMenuOpen);
  };

  function onStatusSelect(
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) {
    if (typeof itemId === 'undefined') {
      return;
    }

    setStatusSelection(itemId.toString());
    setIsStatusMenuOpen(!isStatusMenuOpen);
  }

  const statusToggle = (
    <MenuToggle
      ref={statusToggleRef}
      onClick={onStatusToggleClick}
      isExpanded={isStatusMenuOpen}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      Filter by status
    </MenuToggle>
  );

  const statusMenu = (
    <Menu
      ref={statusMenuRef}
      id="attribute-search-status-menu"
      onSelect={onStatusSelect}
      selected={statusSelection}
    >
      <MenuContent>
        <MenuList>
          <MenuItem itemId="Succeeded">Succeeded</MenuItem>
          <MenuItem itemId="Progressing">Progressing</MenuItem>
          <MenuItem itemId="Failed">Failed</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const statusSelect = (
    <div ref={statusContainerRef}>
      <Popper
        trigger={statusToggle}
        triggerRef={statusToggleRef}
        popper={statusMenu}
        popperRef={statusMenuRef}
        appendTo={statusContainerRef.current || undefined}
        isVisible={isStatusMenuOpen}
      />
    </div>
  );
  // Set up status selection end

  // Set up attribute selector
  const [activeAttributeMenu, setActiveAttributeMenu] = React.useState<
    'Product' | 'Status' | 'PV' | 'Application' | 'ReleasePlan' | 'Tenant'
  >('Product');
  const [isAttributeMenuOpen, setIsAttributeMenuOpen] = React.useState(false);
  const attributeToggleRef = React.useRef<HTMLButtonElement>(null);
  const attributeMenuRef = React.useRef<HTMLDivElement>(null);
  const attributeContainerRef = React.useRef<HTMLDivElement>(null);

  const handleAttribueMenuKeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (!isAttributeMenuOpen) {
        return;
      }
      if (
        attributeMenuRef.current?.contains(event.target as Node) ||
        attributeToggleRef.current?.contains(event.target as Node)
      ) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsAttributeMenuOpen(!isAttributeMenuOpen);
          attributeToggleRef.current?.focus();
        }
      }
    },
    [isAttributeMenuOpen, attributeMenuRef],
  );

  const handleAttributeClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (isAttributeMenuOpen && !attributeMenuRef.current?.contains(event.target as Node)) {
        setIsAttributeMenuOpen(false);
      }
    },
    [isAttributeMenuOpen, attributeMenuRef],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleAttribueMenuKeys);
    window.addEventListener('click', handleAttributeClickOutside);
    return () => {
      window.removeEventListener('keydown', handleAttribueMenuKeys);
      window.removeEventListener('click', handleAttributeClickOutside);
    };
  }, [handleAttribueMenuKeys, handleAttributeClickOutside]);

  // React.useEffect(() => {
  //   window.addEventListener('keydown', handleAttribueMenuKeys);
  //   window.addEventListener('click', handleAttributeClickOutside);
  //   return () => {
  //     window.removeEventListener('keydown', handleAttribueMenuKeys);
  //     window.removeEventListener('click', handleAttributeClickOutside);
  //   };
  // }, [handleAttribueMenuKeys, handleAttributeClickOutside]);

  const onAttributeToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (attributeMenuRef.current) {
        const firstElement = attributeMenuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLElement).focus();
      }
    }, 0);
    setIsAttributeMenuOpen(!isAttributeMenuOpen);
  };

  const attributeToggle = (
    <MenuToggle
      ref={attributeToggleRef}
      onClick={onAttributeToggleClick}
      isExpanded={isAttributeMenuOpen}
      icon={<FilterIcon />}
    >
      {activeAttributeMenu}
    </MenuToggle>
  );
  const attributeMenu = (
    // eslint-disable-next-line no-console
    <Menu
      ref={attributeMenuRef}
      onSelect={(_ev, itemId) => {
        setActiveAttributeMenu(
          itemId?.toString() as
            | 'Product'
            | 'Status'
            | 'PV'
            | 'Application'
            | 'ReleasePlan'
            | 'Tenant',
        );
        setIsAttributeMenuOpen(!isAttributeMenuOpen);
      }}
    >
      <MenuContent>
        <MenuList>
          <MenuItem itemId="Product">Product</MenuItem>
          <MenuItem itemId="Status">Status</MenuItem>
          <MenuItem itemId="PV">PV</MenuItem>
          <MenuItem itemId="Application">Application</MenuItem>
          <MenuItem itemId="Component">Component</MenuItem>
          <MenuItem itemId="ReleasePlan">ReleasePlan</MenuItem>
          <MenuItem itemId="Tenant">Tenant</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  const attributeDropdown = (
    <div ref={attributeContainerRef}>
      <Popper
        trigger={attributeToggle}
        triggerRef={attributeToggleRef}
        popper={attributeMenu}
        popperRef={attributeMenuRef}
        appendTo={attributeContainerRef.current || undefined}
        isVisible={isAttributeMenuOpen}
      />
    </div>
  );

  const [isChecked, setIsChecked] = React.useState<boolean>(true);

  const handleChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setIsChecked(checked);
  };

  const toolbar = (
    <Toolbar
      id="attribute-search-filter-toolbar"
      clearAllFilters={() => {
        setSearchValue('');
        setApplicationSelections([]);
        setTenantSelections([]);
        setPvSelections([]);
        setStatusSelection('');
        setProductSelections([]);
      }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>{attributeDropdown}</ToolbarItem>
            <ToolbarFilter
              chips={searchValue !== '' ? [searchValue] : ([] as string[])}
              deleteChip={() => setSearchValue('')}
              deleteChipGroup={() => setSearchValue('')}
              categoryName="releaseplan"
              showToolbarItem={activeAttributeMenu === 'ReleasePlan'}
            >
              {searchInput}
            </ToolbarFilter>
            <ToolbarFilter
              chips={statusSelection !== '' ? [statusSelection] : ([] as string[])}
              deleteChip={() => setStatusSelection('')}
              deleteChipGroup={() => setStatusSelection('')}
              categoryName="status"
              showToolbarItem={activeAttributeMenu === 'Status'}
            >
              {statusSelect}
            </ToolbarFilter>
            <ToolbarFilter
              chips={pvSelections}
              deleteChip={(_, chip) => onPvMenuSelect(undefined, chip as string)}
              deleteChipGroup={() => setPvSelections([])}
              categoryName="pv"
              showToolbarItem={activeAttributeMenu === 'PV'}
            >
              {pvSelect}
            </ToolbarFilter>
            <ToolbarFilter
              chips={productSelections}
              deleteChip={(_, chip) => onProductMenuSelect(undefined, chip as string)}
              deleteChipGroup={() => setProductSelections([])}
              categoryName="product"
              showToolbarItem={activeAttributeMenu === 'Product'}
            >
              {productSelect}
            </ToolbarFilter>
            <ToolbarFilter
              chips={applicationSelections}
              deleteChip={(_, chip) => onApplicationMenuSelect(undefined, chip as string)}
              deleteChipGroup={() => setApplicationSelections([])}
              categoryName="application"
              showToolbarItem={activeAttributeMenu === 'Application'}
            >
              {applicationSelect}
            </ToolbarFilter>
            <ToolbarFilter
              chips={tenantSelections}
              deleteChip={(_, chip) => onTenantMenuSelect(undefined, chip as string)}
              deleteChipGroup={() => setTenantSelections([])}
              categoryName="tenant"
              showToolbarItem={activeAttributeMenu === 'Tenant'}
            >
              {tenantSelect}
            </ToolbarFilter>
          </ToolbarGroup>
        </ToolbarToggleGroup>
        <ToolbarItem variant="bulk-select">
          <Switch
            label="Show latest releases for each component"
            labelOff="Show all releases for each component"
            id="show-component-release"
            aria-label="Show releases for each component"
            isChecked={isChecked}
            hasCheckIcon
            onChange={handleChange}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const emptyState = (
    <div>
      {loading ? (
        <div>
          <Spinner size="lg" />
          Loading, please wait...
        </div>
      ) : (
        <EmptyState>
          <EmptyStateHeader
            headingLevel="h4"
            titleText="No results found"
            icon={<EmptyStateIcon icon={SearchIcon} />}
          />
          <EmptyStateBody>
            No results match the filter criteria. Clear all filters and try again.
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="link"
                onClick={() => {
                  setSearchValue('');
                  setApplicationSelections([]);
                  setTenantSelections([]);
                  setPvSelections([]);
                  setStatusSelection('');
                  setProductSelections([]);
                }}
              >
                Clear all filters
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      )}
    </div>
  );
  return (
    <>
      <PageLayout
        title="Release Monitor"
        description="The dashboard to monitor your cared releases"
      >
        {/* <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="lg">
          Release Monitoring
        </Title>
      </PageSection> */}
        <PageSection
          padding={{ default: 'noPadding' }}
          variant={PageSectionVariants.light}
          isFilled
        >
          <div
            style={{
              backgroundColor: 'white',
            }}
          >
            {toolbar}
            <Table aria-label="Multiple sticky column table" variant={TableVariant.compact}>
              <Thead>
                <Tr>
                  <Th modifier="nowrap">{columnNames.application}</Th>
                  <Th modifier="nowrap">{columnNames.component}</Th>
                  <Th modifier="nowrap">{columnNames.product}</Th>
                  <Th modifier="nowrap">{columnNames.pv}</Th>
                  <Th modifier="nowrap">{columnNames.name}</Th>
                  <Th modifier="nowrap">{columnNames.status}</Th>
                  <Th modifier="nowrap">{columnNames.completionTime}</Th>
                  <Th modifier="nowrap">{columnNames.releasePlan}</Th>
                  <Th modifier="nowrap">{columnNames.tenant}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredReleases.length > 0 &&
                  filteredReleases.map((release) => (
                    <Tr key={`${release.component}-${release.releasePlan}-${release.name}`}>
                      <Td dataLabel={columnNames.application} modifier="nowrap">
                        <a
                          href={`https://konflux.apps.stone-prod-p02.hjvn.p1.openshiftapps.com/application-pipeline/workspaces/${release.tenant}/applications/${release.application}`}
                        >
                          {release.application}
                        </a>
                      </Td>
                      <Td dataLabel="component" modifier="nowrap">
                        <a
                          href={`https://konflux.apps.stone-prod-p02.hjvn.p1.openshiftapps.com/application-pipeline/workspaces/${release.tenant}/applications/${release.application}/components/${release.component}`}
                        >
                          {release.component}
                        </a>
                      </Td>
                      <Td dataLabel={columnNames.product} modifier="nowrap">
                        {release.product}
                      </Td>
                      <Td dataLabel={columnNames.pv} modifier="nowrap">
                        {release.pv}
                      </Td>
                      <Td dataLabel={columnNames.name} modifier="nowrap">
                        <a
                          href={`https://konflux.apps.stone-prod-p02.hjvn.p1.openshiftapps.com/application-pipeline/workspaces/${release.tenant}/applications/${release.application}/releases/${release.name}`}
                        >
                          {release.name}
                        </a>
                      </Td>
                      <Td dataLabel={columnNames.status} modifier="nowrap">
                        {(() => {
                          if (release.status === 'Failed') {
                            return (
                              <Icon status="danger">
                                <ExclamationCircleIcon />
                              </Icon>
                            );
                          } else if (release.status === 'Succeeded') {
                            return (
                              <Icon status="success">
                                <CheckCircleIcon />
                              </Icon>
                            );
                          }
                          // if (release.status==='Progressing')
                          return (
                            <Icon status="info">
                              <InfoCircleIcon />
                            </Icon>
                          );
                        })()}
                        {release.status ? release.status : 'ReleasePlan never triggred'}
                      </Td>
                      <Td dataLabel={columnNames.completionTime} modifier="nowrap">
                        {release.completionTime ? (
                          <FormattedDate isoDateString={release.completionTime} />
                        ) : (
                          release.completionTime
                        )}
                      </Td>
                      <Td dataLabel={columnNames.releasePlan} modifier="nowrap">
                        <a
                          href={`https://konflux.apps.stone-prod-p02.hjvn.p1.openshiftapps.com/application-pipeline/release/workspaces/${release.tenant}/release-plan`}
                        >
                          {release.releasePlan}
                        </a>
                      </Td>
                      <Td dataLabel={columnNames.tenant} modifier="nowrap">
                        {release.tenant}
                      </Td>
                    </Tr>
                  ))}
                {filteredReleases.length === 0 && (
                  <Tr>
                    <Td colSpan={8}>
                      <Bullseye>{emptyState}</Bullseye>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </div>
        </PageSection>
      </PageLayout>
    </>
  );
};

export default ReleaseMonitor;
