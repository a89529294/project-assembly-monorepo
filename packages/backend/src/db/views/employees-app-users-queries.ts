/**
 * Group the results by entity (employee or app user)
 */
function groupResultsByEntity(results: any[]) {
  const entityMap = new Map();

  for (const row of results) {
    const key = row.id;

    if (!entityMap.has(key)) {
      // Initialize the entity with its basic properties
      entityMap.set(key, {
        id: key,
        employee: {
          id: row.employee_id,
          idNumber: row.id_number,
          chName: row.ch_name,
          phone: row.phone,
          email: row.email,
          // Add other employee properties as needed
        },
        departments: [
          {
            id: row.department_id,
            name: row.department_name,
            jobTitle: row.job_title || "",
          },
        ],
      });
    } else {
      // Add additional departments if this is a duplicate row for the same entity
      const entity = entityMap.get(key);

      // Check if this department is already included
      const departmentExists = entity.departments.some(
        (dept: any) => dept.id === row.department_id
      );

      if (!departmentExists) {
        entity.departments.push({
          id: row.department_id,
          name: row.department_name,
          jobTitle: row.job_title || "",
        });
      }
    }
  }

  return Array.from(entityMap.values());
}
